import { Schema, model } from "mongoose";
import { IRole, IPermission } from "./role.interface";


 const permissionSchema = new Schema<IPermission>(
  {
    pageId: { type: Schema.Types.ObjectId, ref: "Page", required: true },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);


export const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["admin", "manager", "employee", "user"],
      required: [true, "Role type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, "Created by is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    permissions: [permissionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ➤ Virtual for permission counts
roleSchema.virtual("permissionCount").get(function (this: IRole) {
  let create = 0,
    edit = 0,
    view = 0,
    deleteCount = 0;

  this.permissions.forEach((permission) => {
    if (permission.create) create++;
    if (permission.edit) edit++;
    if (permission.view) view++;
    if (permission.delete) deleteCount++;
  });

  return {
    create,
    edit,
    view,
    delete: deleteCount,
    total: create + edit + view + deleteCount,
  };
});

const Role = model<IRole>("Role", roleSchema);
export default Role;
