import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { stockServices } from './stocks.service';

const createStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await stockServices.createStock(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAllStocks = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await stockServices.getAllStocks();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stocks retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await stockServices.getSingleStock(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await stockServices.updateStock(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await stockServices.deleteStock(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const transferStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await stockServices.transferStock(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock transferred successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const stockControllers = {
  createStock,
  getAllStocks,
  getSingleStock,
  updateStock,
  deleteStock,
  transferStock
};
