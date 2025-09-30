// src/modules/user/user.routes.ts
import express from 'express';
import { UserController } from './user.controller';
import { userValidations } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.get('/', auth('admin', 'manager'), UserController.getAllUser);
router.post(
  '/',
  auth('admin'),
  validateRequest(userValidations.createUserValidation),
  UserController.createUser,
);
router.delete(
  '/:id', 
  auth('admin','super_admin'),
  UserController.deleteUser
);
router.patch(
  '/:id', 
  auth('admin','super_admin'),
  UserController.updateUser
);

export const userRoutes = router;