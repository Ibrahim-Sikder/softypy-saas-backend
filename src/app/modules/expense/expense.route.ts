import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import {
  createExpenseCategorySchema,
  createExpenseValidationSchema,
  updateExpenseCategorySchema,
} from './expense.validation';
import { expenseControllers } from './expense.controller';
import { expenseCategoryController } from './expense.category.controller';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(createExpenseValidationSchema),
    expenseControllers.createExpense,
  )
  .get(expenseControllers.getAllExpense);

router
  .route('/:id')
  .get(expenseControllers.getSingleExpense)
  .put(expenseControllers.updateExpense)
  .delete(expenseControllers.deleteExpense);

// Expense Category Routes
router.get(
  '/expense-categories/all',
  expenseCategoryController.getAllExpenseCategories,
);
router.get(
  '/expense-categories/:id',
  expenseCategoryController.getExpenseCategoryById,
);
router.post(
  '/expense-categories/create',
  validateRequest(createExpenseCategorySchema),
  expenseCategoryController.createExpenseCategory,
);
router.put(
  '/expense-categories/update/:id',
  validateRequest(updateExpenseCategorySchema),
  expenseCategoryController.updateExpenseCategory,
);
router.delete(
  '/expense-categories/:id',
  expenseCategoryController.deleteExpenseCategory,
);

export const ExpenseRoutes = router;
