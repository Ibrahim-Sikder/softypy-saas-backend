import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { categoryServices } from './category.service';

const createCategory = async (
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

    const result = await categoryServices.createCategory(payload, file);


    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  } catch (err: any) {

    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryServices.getAllCategory(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category are retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const getSingleCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await categoryServices.getSinigleCategory(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await categoryServices.deleteCategory(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  try {
    const { id } = req.params;
    const result = await categoryServices.updateCategory(id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category update succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const categoryControllers = {
  getAllCategory,
  getSingleCategory,
  deleteCategory,
  updateCategory,
  createCategory,
};
