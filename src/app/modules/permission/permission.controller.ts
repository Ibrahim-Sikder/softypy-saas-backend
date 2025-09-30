import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PermissionService } from './permission.service';
import AppError from '../../errors/AppError';

const checkPermission = catchAsync(async (req: Request, res: Response) => {
  const tenantDomain = req.query.tenantDomain as string;
  const result = await PermissionService.checkPermission(
    tenantDomain,
    req.body,
  );

  sendResponse<{ hasPermission: boolean }>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permission checked successfully',
    data: { hasPermission: result },
  });
});

const getUserPermissions = catchAsync(async (req: Request, res: Response) => {
  const tenantDomain = req.query.tenantDomain as string;
  const userId = req.params.userId || (req.user?.userId as string);

  if (!userId) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'User ID is required',
      data: null,
    });
    return;
  }

  const result = await PermissionService.getUserPermissions(tenantDomain, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User permissions retrieved successfully',
    data: result,
  });
});

const createUserPermission = catchAsync(async (req: Request, res: Response) => {
  const tenantDomain = req.query.tenantDomain as string;

  // Ensure userId comes as array from body (better than params)
  const userIds = Array.isArray(req.params.userId) ? req.params.userId : [req.params.userId];

  const result = await PermissionService.createUserPermission(
    tenantDomain,
    userIds,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User permission created successfully',
    data: result,
  });
});


const updateRolePermissions = catchAsync(
  async (req: Request, res: Response) => {
    const tenantDomain = req.query.tenantDomain as string;
    await PermissionService.updateRolePermissions(
      tenantDomain,
      req.params.roleId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Role permissions updated successfully',
      data: null,
    });
  },
);

const getMyPermissions = catchAsync(async (req: Request, res: Response) => {
  const tenantDomain = req.query.tenantDomain as string;
  if (!req.user?.userId) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not authenticated');
  }

  const result = await PermissionService.getUserPermissions(tenantDomain, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your permissions retrieved successfully',
    data: result,
  });
});

export const PermissionController = {
  checkPermission,
  getUserPermissions,
  createUserPermission,
  updateRolePermissions,
  getMyPermissions,
};