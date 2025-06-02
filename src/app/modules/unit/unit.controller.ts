import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { unitServices } from './unit.service';

const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  const domain =
    (req.headers.origin as string) || (req.headers.host as string) || '';
  try {
    const result = await unitServices.createUnit(domain, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unit created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllUnit = async (req: Request, res: Response, next: NextFunction) => {
    const domain =
    (req.headers.origin as string) || (req.headers.host as string) || '';
  try {
    const result = await unitServices.getAllUnit(domain, req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unit are retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const getSingleUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await unitServices.getSinigleUnit(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unit is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await unitServices.deleteUnit(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unit deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await unitServices.updateUnit(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unit update succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const unitControllers = {
  getAllUnit,
  getSingleUnit,
  deleteUnit,
  updateUnit,
  createUnit,
};
