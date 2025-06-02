import { Model, Document, Types, ObjectId } from 'mongoose';

import { USER_ROLE } from './user.constant';

export interface TUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  tenantId:Types.ObjectId;
  createdBy: string;
  status: 'active' | 'inactive';
  role: Types.ObjectId;
  lastLogin?: Date;
  passwordChangeAt: Date;
  isDeleted: boolean;
}


export interface UserModel extends Model<TUser> {
  isUserExistsByCustomId(name: string): Promise<TUser>;
  isPasswordMatched(
    plaingTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
