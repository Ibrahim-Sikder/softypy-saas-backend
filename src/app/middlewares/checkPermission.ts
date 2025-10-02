// src/middlewares/permission.ts
import { NextFunction, Request, Response } from 'express';
import { PermissionService } from '../modules/permission/permission.service';
import AppError from '../errors/AppError';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    tenantId: string;
  };
  tenantId?: string;
}

interface PermissionRequest {
  pageId: string;
  action: 'create' | 'edit' | 'view' | 'delete';
}

export const checkPermission = (pageId: string, action: 'create' | 'edit' | 'view' | 'delete') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantDomain = req.query.tenantDomain as string;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const hasPermission = await PermissionService.checkPermission(tenantDomain, {
        userId,
        pageId,
        action,
      } as any);

      if (!hasPermission) {
        throw new AppError(403, 'Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};