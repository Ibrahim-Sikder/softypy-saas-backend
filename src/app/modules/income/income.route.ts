import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { incomeValidation } from './income.validation';
import { incomeController } from './income.controller';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(incomeValidation.incomeValidationSchema),
    incomeController.createIncome,
  )
  .get(incomeController.getAllIncomes);

router
  .route('/:id')
  .get(incomeController.getSingleIncome)
  .put(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

export const IncomeRoutes = router;
