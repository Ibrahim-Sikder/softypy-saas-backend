// src/modules/role/role.model.ts
import { Schema, Types, model } from 'mongoose';
import { IRole } from './role.interface';

// Sub-schema for embedded permissions
// const permissionSubSchema = new Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     action: { type: String, required: true, trim: true },
//     module: { type: String, required: true, trim: true },
//   },
//   { _id: false }
// );

export const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['admin', 'manager', 'employee', 'user'],
      required: [true, 'Role type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      type: Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

const Role = model<IRole>('Role', roleSchema);

export default Role;
