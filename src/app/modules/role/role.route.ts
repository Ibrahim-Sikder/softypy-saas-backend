import express from 'express';


import validateRequest from '../../middlewares/validateRequest';
import { auth } from '../../middlewares/auth';
import { RoleController } from './role.controller';
import { RoleValidation } from './role.validation';

const router = express.Router();


router.post(
  '/',
//   validateRequest(RoleValidation.createRoleZodSchema),
//   auth('admin'),
  RoleController.createRole
);


router.get(
  '/',
//   auth('admin', 'manager'),
  RoleController.getAllRoles
);


router.get(
  '/:id',
//   auth('admin', 'manager'),
  RoleController.getRoleById
);


router.put(
  '/:id',
//   validateRequest(RoleValidation.updateRoleZodSchema),
//   auth('admin'),
  RoleController.updateRole
);


router.delete(
  '/:id',
//   auth('admin'),
  RoleController.deleteRole
);

export const RoleRoutes = router;