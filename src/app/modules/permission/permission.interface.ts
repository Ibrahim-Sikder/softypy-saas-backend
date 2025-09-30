import { Document, Types } from 'mongoose';

export interface IPermissionRequest {
  create?: boolean;
  edit?: boolean;
  view?: boolean;
  delete?: boolean;
  roleId: string[];
  pageId: string[];
}

export interface IUserPermission {
  userId: Types.ObjectId[];
  roleId: Types.ObjectId[];
  pageId: Types.ObjectId[];
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

export interface IPermissionDocument extends Document {
  userId: Types.ObjectId[];
  roleId: Types.ObjectId[];
  pageId: Types.ObjectId[];
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
