// src/modules/stockTransaction/stockTransaction.controller.ts

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { stockTransactionServices } from './stockTransaction.service';

const createStockTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await stockTransactionServices.createStockTransaction(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Stock transaction created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAllStockTransactions = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await stockTransactionServices.getAllStockTransactions();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All stock transactions retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleStockTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await stockTransactionServices.getSingleStockTransaction(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single stock transaction retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const stockTransactionControllers = {
  createStockTransaction,
  getAllStockTransactions,
  getSingleStockTransaction,
};
