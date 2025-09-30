import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import config from '../config';
import { getTenantModel } from '../utils/getTenantModels';

export const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) throw new AppError(401, 'You are not authorized! Please login');

    const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
    const { userId, tenantId, role, iat } = decoded;

    if (!tenantId) throw new AppError(401, 'Tenant info missing in token');

    // Get User model from tenant DB
    const { Model: UserModel } = await getTenantModel(tenantId, 'User');
    const user = await UserModel.findById(userId).select('+password');

    if (!user) throw new AppError(404, 'User not found');
    if (user.status === 'inactive') throw new AppError(403, 'User inactive');

    // Check if password was changed after token was issued
    if (user.passwordChangeAt && new Date(user.passwordChangeAt).getTime() / 1000 > (iat as number)) {
      throw new AppError(401, 'Password recently changed');
    }

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(403, 'Access Denied');
    }

    req.user = decoded; 
    req.tenantId = tenantId;
    next();
  });
};

