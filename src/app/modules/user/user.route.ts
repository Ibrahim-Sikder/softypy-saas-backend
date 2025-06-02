import express from 'express';
import { UserController } from './user.controller';
import { userValidations } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import { auth } from '../../middlewares/auth';
const router = express.Router();

router.get('/',  UserController.getAllUser);
router.post(
  '/',
  validateRequest(userValidations.createUserValidation),
  UserController.createUser,
);
router.delete('/:id', 
  // auth('admin','super_admin'),
 UserController.deleteUser);
export const userRoutes = router;
