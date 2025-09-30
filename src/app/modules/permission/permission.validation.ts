import { z } from 'zod';

export const permissionRequestSchema = z.object({
  body: z.object({
    roleId: z.array(z.string({ required_error: 'Role ID is required' })),
    userId: z.array(z.string()).optional(),
    pageId: z.array(z.string({ required_error: 'Page ID is required' })),
    create: z.boolean().optional(),
    edit: z.boolean().optional(),
    view: z.boolean().optional(),
    delete: z.boolean().optional(),
  }),
});

export const checkPermissionZodSchema = {
  body: z.object({
    userId: z.array(z.string()).optional(),
    roleId: z.array(z.string({ required_error: 'Role ID is required' })),
    pageId: z.array(z.string({ required_error: 'Page ID is required' })),
    action: z.enum(['create', 'edit', 'view', 'delete'], {
      required_error: 'Action is required',
    }),
  }),
};

export const updateRolePermissionsZodSchema = {
  body: z.array(permissionRequestSchema),
  params: z.object({
    roleId: z.string({
      required_error: 'Role ID is required',
    }),
  }),
};