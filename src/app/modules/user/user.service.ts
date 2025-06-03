/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import httpStatus from 'http-status';
import { TUser } from './user.interface';
import { User } from './user.model';
import { createToken } from '../Auth/auth.utils';
import config from '../../config';
import AppError from '../../errors/AppError';
import { getTenantModel } from '../../utils/getTenantModels';

export const createUser = async (payload: TUser) => {
  const { Model: User, tenant } = await getTenantModel(payload.tenantDomain, 'User');
  console.log(payload)

  const userByEmail = await User.findOne({ email: payload.email });
  if (userByEmail) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is already registered!');
  }

  const userByName = await User.findOne({ name: payload.name });
  if (userByName) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Username is already taken!');
  }

  const newUser = await User.create({
    ...payload,
    tenantId: tenant._id, 
  });

  const jwtPayload = {
    userId: newUser._id.toString(),
    name: newUser.name,
    role: newUser.role,
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
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId: tenant._id,
      token: accessToken,
    },
  };
};



const getAllUser = async (tenantDomain: string) => {
  const { Model: User } = await getTenantModel(tenantDomain, 'User');
  const result = await User.find();

  return result;
};

const deleteUser = async (id: string) => {
  const result = await User.deleteOne({ _id: id });

  return result;
};


export const UserServices = {
  createUser,
  getAllUser,
  deleteUser
};
