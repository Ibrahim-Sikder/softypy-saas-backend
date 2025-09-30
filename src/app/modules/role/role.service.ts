// src/modules/role/role.service.ts
import httpStatus from 'http-status';
import { IRole, } from './role.interface';
import AppError from '../../errors/AppError';
import { getTenantModel } from '../../utils/getTenantModels';

const createRole = async (
  tenantDomain: string,
  payload: IRole
) => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const { Model: Page } = await getTenantModel(tenantDomain, 'Page');

  // Check if the role name already exists
  const roleExists = await Role.findOne({name: payload.name});
  if (roleExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Role name already exists!');
  }

  // Validate permissions
  if (payload.permissions && payload.permissions.length > 0) {
    const pageIds = payload.permissions.map((p) => p.pageId);
    const pages = await Page.find({ _id: { $in: pageIds } });

    if (pages.length !== pageIds.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Some pages do not exist!');
    }
  }

  // Create role
  return await Role.create(payload);
};

const getAllRoles = async (tenantDomain: string) => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  return Role.find().populate('permissions.pageId');
};

const getRoleById = async (
  tenantDomain: string,
  id: string
)  => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const result = await Role.findById(id).populate('permissions.pageId');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }
  return result;
};

const updateRole = async (
  tenantDomain: string,
  id: string,
  payload: Partial<IRole>
) => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const { Model: Page } = await getTenantModel(tenantDomain, 'Page');

  // Check if role exists
  const role = await Role.findById(id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  // Check for duplicate name
  if (payload.name && payload.name !== role.name) {
    const roleExists = await Role.findOne({name: payload.name});
    if (roleExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Role name already exists!');
    }
  }

  // Validate permissions
  if (payload.permissions && payload.permissions.length > 0) {
    const pageIds = payload.permissions.map((p) => p.pageId);
    const pages = await Page.find({ _id: { $in: pageIds } });
    if (pages.length !== pageIds.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Some pages do not exist!');
    }
  }

  // Update role
  const result = await Role.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('permissions.pageId');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  return result;
};

const deleteRole = async (
  tenantDomain: string,
  id: string
) => {
  const { Model: Role } = await getTenantModel(tenantDomain, 'Role');
  const { Model: User } = await getTenantModel(tenantDomain, 'User');

  // Check if role exists
  const role = await Role.findById(id);
  if (!role) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  // Check if role is assigned to users
  const usersWithRole = await User.countDocuments({ roleId: id });
  if (usersWithRole > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot delete role. ${usersWithRole} users are assigned to this role.`
    );
  }

  const result = await Role.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Role not found!');
  }

  return result;
};

export const RoleService = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
