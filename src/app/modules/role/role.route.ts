// src/modules/role/role.routes.ts
import express from 'express';
import { RoleController } from './role.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createRoleValidationSchema, updateRoleValidationSchema } from './role.validation';

const router = express.Router();

router.post(
  '/',
  auth('admin', 'superadmin'),
  // validateRequest(createRoleValidationSchema),
  RoleController.createRole
);

router.get(
  '/',
  auth('admin', 'superadmin'),
  RoleController.getAllRoles
);

router.get(
  '/:id',
  auth('admin', 'manager'),
  RoleController.getRoleById
);

router.put(
  '/:id',
  auth('admin'),
  validateRequest(updateRoleValidationSchema),
  RoleController.updateRole
);

router.delete(
  '/:id',
  auth('admin'),
  RoleController.deleteRole
);

router.post(
  '/:roleId/permissions',
  auth('admin'),
  RoleController.assignPermissionsToRole
);

export const RoleRoutes = router;