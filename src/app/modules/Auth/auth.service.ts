/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';

import { TLoginUser } from './auth.interface';
import { createToken } from './auth.utils';
import config from '../../config';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { User, userSchema } from '../user/user.model';
import { connectToTenantDatabase } from '../../../server';
import { Tenant } from '../tenant/tenant.model';


export const loginUser = async (payload: TLoginUser) => {
  const tenant = await Tenant.findOne({ domain: payload.tenantDomain });

  if (!tenant || !tenant.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenant not found or inactive');
  }

  if (!tenant.subscription || !tenant.subscription.isPaid || !tenant.subscription.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, 'Subscription is inactive or not paid');
  }

  const tenantConnection = await connectToTenantDatabase(
    tenant._id.toString(),
    tenant.dbUri
  );

  const User = tenantConnection.model('User', userSchema);

  const user = await User.findOne({ name: payload.name }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid username or password');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid username or password');
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    tenantId: tenant._id.toString(),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    user: {
      userId: user._id,
      name: user.name,
      role: user.role,
      tenantId: tenant._id,
      token: accessToken,
    },
  };
};



const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  
  const user = await User.isUserExistsByCustomId(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found ');
  }

  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted!');
  }


  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round),
  );

  const result = await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return result;
};




export const AuthServices = {
  loginUser,
  changePassword,

};
