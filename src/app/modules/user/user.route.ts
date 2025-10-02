// src/modules/user/user.routes.ts
import express from 'express';
import { UserController } from './user.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { userValidations } from './user.validation';
const router = express.Router();

router.post(
  '/',
  validateRequest(userValidations.createUserValidation),
  UserController.createUser
);

router.get(
  '/',
  auth('admin', 'manager'),
  UserController.getAllUser
);

router.get(
  '/:userId/permissions',
  auth('admin', 'manager', 'user'),
  UserController.getUserPermissions
);

router.delete(
  '/:id',
  auth('admin'),
  UserController.deleteUser
);

router.put(
  '/:id',
  auth('admin', 'manager'),
  UserController.updateUser
);

router.post(
  '/:userId/role',
  auth('admin'),
  UserController.assignRoleToUser
);

export const userRoutes = router;