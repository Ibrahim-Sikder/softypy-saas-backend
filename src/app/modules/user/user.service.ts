/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import httpStatus from 'http-status';
import { TUser } from './user.interface';
import { createToken } from '../Auth/auth.utils';
import config from '../../config';
import AppError from '../../errors/AppError';
import { getTenantModel } from '../../utils/getTenantModels';
import { Tenant } from '../tenant/tenant.model';
import { User } from './user.model';

export const createUser = async (payload: TUser) => {
  const { Model: User, tenant } = await getTenantModel(
    payload.tenantDomain,
    'User',
  );

  const userByEmail = await User.findOne({ email: payload.email });
  if (userByEmail) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is already registered!');
  }

  const userByName = await User.findOne({ name: payload.name });
  if (userByName) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Username is already taken!');
  }

  const tenantInfo = await Tenant.findOne({ domain: payload.tenantDomain });
  if (!tenantInfo) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Tenant not found!');
  }

  const newUser = await User.create({
    ...payload,
    tenantId: tenantInfo._id,
    tenantInfo: {
      name: tenantInfo.name,
      domain: tenantInfo.domain,
      businessType: tenantInfo.businessType,
      dbUri: tenantInfo.dbUri,
      isActive: tenantInfo.isActive,
      subscription: tenantInfo.subscription,
    },
  });

  const jwtPayload = {
    userId: newUser._id.toString(),
    name: newUser.name,
    role: newUser.role,
    tenantId: tenantInfo._id.toString(),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId: tenantInfo._id,
      token: accessToken,
      tenantInfo: newUser.tenantInfo,
    },
  };
};

const getAllUser = async (tenantDomain: string) => {
  if (tenantDomain) {
    const { Model: User } = await getTenantModel(tenantDomain, 'User');
    const result = await User.find();
    return result;
  } else {
    const result = await User.find();

    return result;
  }
};

const deleteUser = async (tenantDomain: string, id: string) => {
  const { Model: User } = await getTenantModel(tenantDomain, 'User');
  const result = await User.deleteOne({ _id: id });
  return result;
};

const updateUser = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TUser>,
) => {
  const { Model: User } = await getTenantModel(tenantDomain, 'User');

  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Optional: Prevent duplicate email or username
  if (payload.email && payload.email !== existingUser.email) {
    const emailExists = await User.findOne({ email: payload.email });
    if (emailExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Email already in use!');
    }
  }

  if (payload.name && payload.name !== existingUser.name) {
    const nameExists = await User.findOne({ name: payload.name });
    if (nameExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Username already taken!');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

export const UserServices = {
  createUser,
  getAllUser,
  deleteUser,
  updateUser,
};


