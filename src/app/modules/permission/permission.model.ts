import { Schema, Types, model } from 'mongoose';
import { IUserPermission } from './permission.interface';

export const permissionSchema = new Schema<IUserPermission>(
  {
    userId: [{ type: Types.ObjectId, ref: 'User', required: true }],
    roleId: [{ type: Types.ObjectId, ref: 'Role', required: true }],
    pageId: [{ type: Types.ObjectId, ref: 'Page', required: true }],
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Permission = model<IUserPermission>('Permission', permissionSchema);
