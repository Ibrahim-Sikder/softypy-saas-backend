import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { employeeController } from './employee.controller';
import { employeeValidation } from './employee.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(employeeValidation.employeeValidationSchema),
    employeeController.createEmployee,
  )
  .get(employeeController.getAllEmployees);

router
  .route('/:id')
  .get(employeeController.getSingleEmployee)
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

router.route('/recycle/:id').patch(employeeController.moveToRecycledEmployee);
router
  .route('/restore/:id')
  .patch(employeeController.restoreFromRecycledEmployee);
router
  .route('/delete-permenantly/:id')
  .delete(employeeController.permanentlyDeleteEmployee);

router.patch(
  '/recycle-all',
  employeeController.moveAllToRecycledBinMoneyReceipts,
);
router.patch(
  '/restore-all',
  employeeController.restoreAllFromRecycledBinMoneyReceipts,
);

export const EmployeeRoutes = router;
