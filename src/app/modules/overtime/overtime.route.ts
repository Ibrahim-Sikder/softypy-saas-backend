import express from 'express';
import validateRequest from '../../middlewares/validateRequest';

import { employeeOvertimeControllers } from './overtime.controller';
import {
  EmployeeOvertimeValidationSchema,
  updateValidationSchema,
} from './overtime.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(EmployeeOvertimeValidationSchema),
  employeeOvertimeControllers.createEmployeeOvertime,
);

router.get('/', employeeOvertimeControllers.getAllEmployeeOvertimes);

router.get(
  '/:overtimeId',
  employeeOvertimeControllers.getSingleEmployeeOvertime,
);

router.patch(
  '/:overtimeId',
  validateRequest(updateValidationSchema),
  employeeOvertimeControllers.updateEmployeeOvertime,
);

router.delete(
  '/:overtimeId',
  employeeOvertimeControllers.deleteEmployeeOvertime,
);

export const employeeOvertimeRoutes = router;

