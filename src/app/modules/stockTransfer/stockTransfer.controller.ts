

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { stockTransferServices } from './stockTransfer.services';



const getAllStockTransfers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await stockTransferServices.getAllStockTransfers();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stock transfer history retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteStockTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await stockTransferServices.deleteStockTransfer(id);
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

export const stockTransferControllers = {
  getAllStockTransfers,
  deleteStockTransfer
};
