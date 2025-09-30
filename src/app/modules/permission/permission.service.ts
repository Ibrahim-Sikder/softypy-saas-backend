import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import {
  IPermissionRequest,
} from './permission.interface';
import AppError from '../../errors/AppError';
import { getTenantModel } from '../../utils/getTenantModels';

export const checkPermission = async (
  tenantDomain: string,
  payload:any
): Promise<boolean> => {
  const { userId, pageId, action } = payload;

  const { Model: User } = await getTenantModel(tenantDomain, 'User');
  const { Model: Permission } = await getTenantModel(tenantDomain, 'Permission');

  const userObjectIds = userId.map((id:any) => new mongoose.Types.ObjectId(id));
  const pageObjectIds = pageId.map((id:any)=>new mongoose.Types.ObjectId(id));

  const user = await User.findOne({ _id: { $in: userObjectIds } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // Superadmin shortcut
  if (user.role === 'superadmin') return true;

  // Find permission for any of the user-page combination
  const permission = await Permission.findOne({
    userId: { $in: userObjectIds },
    pageId: { $in: pageObjectIds },
  });

  if (!permission) return false;

  return permission[action] === true;
};

export const getUserPermissions = async (
  tenantDomain: string,
  userId: string
) => {
  const { Model: User } = await getTenantModel(tenantDomain, 'User');
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const { Model: Page } = await getTenantModel(tenantDomain, 'Page');
  const { Model: Permission } = await getTenantModel(tenantDomain, 'Permission');

  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const role = await Role.findById(user.roleId[0]);
  if (!role) throw new AppError(httpStatus.NOT_FOUND, 'Role not found');

  const pages = await Page.find({ status: 'active' });
  const permissionMatrix = {};



  return {
    userId,
    roleId: role._id.toString(),
    roleName: role.name,
    roleType: role.type,
    permissions: permissionMatrix,
  };
};


export const createUserPermission = async (
  tenantDomain: string,
  userIds: string[],        // array of user IDs
  permissionData: IPermissionRequest
) => {
  const { Model: User } = await getTenantModel(tenantDomain, 'User');
  const { Model: Page } = await getTenantModel(tenantDomain, 'Page');
  const { Model: Permission } = await getTenantModel(tenantDomain, 'Permission');
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');

  try {
    const userObjectIds = userIds.map(id => new mongoose.Types.ObjectId(id));
    const roleObjectIds = permissionData.roleId.map(id => new mongoose.Types.ObjectId(id));
    const pageObjectIds = permissionData.pageId.map(id => new mongoose.Types.ObjectId(id));

    // Validate existence
    const [users, roles, pages] = await Promise.all([
      User.find({ _id: { $in: userObjectIds } }),
      Role.find({ _id: { $in: roleObjectIds } }),
      Page.find({ _id: { $in: pageObjectIds } }),
    ]);

    if (!users.length) throw new AppError(404, 'No users found');
    if (!roles.length) throw new AppError(404, 'No roles found');
    if (!pages.length) throw new AppError(404, 'No pages found');

    const createdPermissions: any[] = [];

    for (const user of users) {
      for (const role of roles) {
        for (const page of pages) {
          // Check if permission exists for this combination
          let permission = await Permission.findOne({
            userId: user._id,
            roleId: role._id,
            pageId: page._id,
          });

          if (permission) {
            // Update existing
            permission.create = permissionData.create ?? permission.create;
            permission.edit = permissionData.edit ?? permission.edit;
            permission.view = permissionData.view ?? permission.view;
            permission.delete = permissionData.delete ?? permission.delete;
            await permission.save();
          } else {
            // Create new permission
            permission = await Permission.create({
              userId: [user._id],
              roleId: [role._id],
              pageId: [page._id],
              create: permissionData.create ?? false,
              edit: permissionData.edit ?? false,
              view: permissionData.view ?? false,
              delete: permissionData.delete ?? false,
            });
          }

          // Attach permission, role, page to user
          await User.findByIdAndUpdate(user._id, {
            $addToSet: {
              roleId: { $each: [role._id] },
              pageId: { $each: [page._id] },
              permission: { $each: [permission._id] },
            },
          });

          createdPermissions.push(permission._id);
        }
      }
    }

    // Populate before returning
    const populatedPermissions = await Permission.find({
      _id: { $in: createdPermissions },
    })
      .populate('userId', 'name email')
      .populate('roleId', 'name type')
      .populate('pageId', 'name path');

    return populatedPermissions;
  } catch (error: any) {
    console.error(error);
    throw new AppError(400, error.message || 'Unexpected error while creating permissions');
  }
};


export const updateRolePermissions = async (
  tenantDomain: string,
  roleId: string,
  permissions: IPermissionRequest[]
): Promise<void> => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const { Model: Page } = await getTenantModel(tenantDomain, 'Page');
  const { Model: Permission } = await getTenantModel(tenantDomain, 'Permission');
  const { Model: User } = await getTenantModel(tenantDomain, 'User');

  const roleObjectId = new mongoose.Types.ObjectId(roleId);
  const role = await Role.findById(roleObjectId);
  if (!role) throw new AppError(httpStatus.NOT_FOUND, 'Role not found');

  const pageIds = permissions.flatMap(p => p.pageId);
  const pageObjectIds = pageIds.map(id => new mongoose.Types.ObjectId(id));
  const pages = await Page.find({ _id: { $in: pageObjectIds } });
  if (pages.length !== pageIds.length) throw new AppError(httpStatus.BAD_REQUEST, 'Some pages do not exist');

  const users = await User.find({ roleId: roleObjectId });

  for (const user of users) {
    for (const permData of permissions) {
      const permPageObjectIds = permData.pageId.map(id => new mongoose.Types.ObjectId(id));

      let existingPermission = await Permission.findOne({
        userId: user._id,
        pageId: { $in: permPageObjectIds },
      });

      if (existingPermission) {
        existingPermission.roleId = [roleObjectId];
        existingPermission.create = permData.create ?? existingPermission.create;
        existingPermission.edit = permData.edit ?? existingPermission.edit;
        existingPermission.view = permData.view ?? existingPermission.view;
        existingPermission.delete = permData.delete ?? existingPermission.delete;
        await existingPermission.save();
      } else {
        const newPermission = await Permission.create({
          userId: [user._id],
          roleId: [roleObjectId],
          pageId: permPageObjectIds,
          create: permData.create ?? false,
          edit: permData.edit ?? false,
          view: permData.view ?? false,
          delete: permData.delete ?? false,
        });

        await User.findByIdAndUpdate(user._id, {
          $addToSet: {
            permission: { $each: [newPermission._id] },
            pageId: { $each: permPageObjectIds },
          },
        });
      }
    }
  }
};


export const PermissionService = {
  checkPermission,
  getUserPermissions,
  createUserPermission,
  updateRolePermissions,
};