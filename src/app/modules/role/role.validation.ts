import { z } from 'zod';

// Permission schema for validation
const permissionSchema = z.object({
  pageId: z.string({
    required_error: 'Page ID is required',
  }),
  create: z.boolean().default(false),
  edit: z.boolean().default(false),
  view: z.boolean().default(false),
  delete: z.boolean().default(false),
});

// Schema for creating a role
const createRoleZodSchema = {
  body: z.object({
    name: z.string({
      required_error: 'Role name is required',
    }),
    type: z.enum(['admin', 'manager', 'employee', 'user'], {
      required_error: 'Role type is required',
    }),
    description: z.string().optional(),
    createdBy: z.string({
      required_error: 'Created by is required',
    }),
    status: z.enum(['active', 'inactive']).default('active'),
    permissions: z.array(permissionSchema).optional(),
  }),
};

// Schema for updating a role
const updateRoleZodSchema = {
  body: z.object({
    name: z.string().optional(),
    type: z.enum(['admin', 'manager', 'employee', 'user']).optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    permissions: z.array(permissionSchema).optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Role ID is required',
    }),
  }),
};

export const RoleValidation = {
  createRoleZodSchema,
  updateRoleZodSchema,
};