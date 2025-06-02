import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { expenseServices } from './expense.service';



const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    const payload = req.body;
    if (payload.data) {
      Object.assign(payload, JSON.parse(payload.data));
      delete payload.data;
    }

    const result = await expenseServices.createExpense(payload, file);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};
const getAllExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await expenseServices.getAllExpense(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense are retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const getSingleExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await expenseServices.getSinigleExpense(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await expenseServices.deleteExpense(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await expenseServices.updateExpense(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Expense update succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const expenseControllers = {
  getAllExpense,
  getSingleExpense,
  deleteExpense,
  updateExpense,
  createExpense,
};
