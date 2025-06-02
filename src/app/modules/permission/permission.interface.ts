import { Types } from 'mongoose';
import { Document, Model } from 'mongoose';
import { IPage } from '../page/page.interface';

// Basic permission structure for a single page
export interface IPermission {
  pageId: Types.ObjectId;
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}


// Extended permission with page details (for populating)
export interface IPermissionWithPage extends IPermission {
  page?: IPage;
}

// Permission request format (for API requests)
export interface IPermissionRequest {
  pageId: string;
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

// Structure for checking a specific permission
export interface IPermissionCheck {
  userId: string;
  pageId: string;
  action: 'create' | 'edit' | 'view' | 'delete';
}

// Permission matrix for efficient permission checking
export interface IPermissionMatrix {
  [pageId: string]: {
    create: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
  };
}

// User permissions with role information
export interface IUserPermissions {
  userId: string;
  roleId: string;
  roleName: string;
  roleType: string;
  permissions: IPermissionMatrix;
}

// Permission model interfaces
export interface IPermissionModel extends Model<IPermissionDocument> {
  findByPageAndRole(pageId: string, roleId: string): Promise<IPermissionDocument | null>;
  findByRole(roleId: string): Promise<IPermissionDocument[]>;
  deleteByRole(roleId: string): Promise<void>;
}

export interface IPermissionDocument extends Document {
  roleId: Types.ObjectId;
  pageId: Types.ObjectId;
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

// Permission count for statistics
export interface IPermissionCount {
  create: number;
  edit: number;
  view: number;
  delete: number;
  total: number;
}