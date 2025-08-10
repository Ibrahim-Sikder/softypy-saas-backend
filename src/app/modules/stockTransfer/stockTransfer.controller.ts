

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { stockTransferServices } from './stockTransfer.services';



const getAllStockTransfers = async (req: Request, res: Response, next: NextFunction) => {
  try {
     const tenantDomain = req.query.tenantDomain as string;
    const result = await stockTransferServices.getAllStockTransfers(tenantDomain);
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
    const tenantDomain = req.query.tenantDomain as string;
    const result = await stockTransferServices.deleteStockTransfer(tenantDomain, id);
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
