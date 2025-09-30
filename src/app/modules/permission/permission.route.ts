// src/modules/permission/permission.routes.ts
import { Router } from 'express';
import { PermissionController } from './permission.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { permissionRequestSchema } from './permission.validation';

const router = Router();

router.post(
  '/user/:userId',
  validateRequest(permissionRequestSchema),
  auth('admin', 'superadmin'),
  PermissionController.createUserPermission,
);
router.post(
  '/check',
  auth('admin', 'superadmin'),
  PermissionController.checkPermission,
);
router.get(
  '/user/:userId',
  auth('admin', 'superadmin'),
  PermissionController.getUserPermissions,
);
router.get(
  '/my-permissions',
  auth('admin', 'superadmin'),
  PermissionController.getMyPermissions,
);
router.put(
  '/role/:roleId',
  auth('admin', 'superadmin'),
  PermissionController.updateRolePermissions,
);

export const permissionRouters = router;
