import sendResponse from '../../utils/sendResponse';
import { metServices } from './meta.service';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const getAllCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await metServices.getAllCustomer(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All customer fetched successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAllMetaFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await metServices.getAllMetaFromDB(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All running project fetched successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
export const metaController = {
  getAllCustomer,
  getAllMetaFromDB,
};
