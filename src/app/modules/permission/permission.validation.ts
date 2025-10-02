// src/modules/permission/permission.validation.ts
import { z } from 'zod';

export const permissionRequestSchema = z.object({
  body: z.object({
    roleId: z.string({
      required_error: 'Role ID is required',
    }),
    pageId: z.string({
      required_error: 'Page ID is required',
    }),
    create: z.boolean().optional(),
    edit: z.boolean().optional(),
    view: z.boolean().optional(),
    delete: z.boolean().optional(),
  }),
});

export const checkPermissionZodSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    pageId: z.string({
      required_error: 'Page ID is required',
    }),
    action: z.enum(['create', 'edit', 'view', 'delete'], {
      required_error: 'Action is required',
    }),
  }),
});
