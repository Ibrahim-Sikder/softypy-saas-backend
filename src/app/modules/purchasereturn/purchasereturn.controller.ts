import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { purchaseReturnServices } from './purchasereturn.service';

const createPurchaseReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const result = await purchaseReturnServices.createPurchaseReturn(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Purchase return created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAllPurchaseReturns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await purchaseReturnServices.getAllPurchaseReturns(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Purchase returns retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSinglePurchaseReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await purchaseReturnServices.getSinglePurchaseReturn(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Purchase return retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updatePurchaseReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await purchaseReturnServices.updatePurchaseReturn(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Purchase return updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deletePurchaseReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await purchaseReturnServices.deletePurchaseReturn(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Purchase return deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const purchaseReturnControllers = {
  createPurchaseReturn,
  getAllPurchaseReturns,
  getSinglePurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
};
