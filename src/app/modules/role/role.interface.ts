import { Document, Model, Types } from "mongoose";
import { IPage } from "../page/page.interface";

// Permission for a page
export interface IPermission {
  pageId: Types.ObjectId;
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

export interface IRole {
  name: string;
  type: "admin" | "manager" | "employee" | "user";
  description?: string;
  createdBy: string;
  status: "active" | "inactive";
  permissions: IPermission[];
}

