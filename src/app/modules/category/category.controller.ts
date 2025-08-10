import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { categoryServices } from './category.service';
import AppError from '../../errors/AppError';

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    const payload = req.body;
    const { tenantDomain } = req.body;

    if (payload.data) {
      Object.assign(payload, JSON.parse(payload.data));
      delete payload.data;
    }

    const result = await categoryServices.createCategory(
      tenantDomain,
      payload,
      file,
    );

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
    const tenantDomain =
      (req.headers['x-tenant-domain'] as string) ||
      (req.query.tenantDomain as string) ||
      req.headers.host ||
      '';

    if (!tenantDomain) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Tenant domain is required');
    }

    const result = await categoryServices.getAllCategory(
      tenantDomain,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Categories retrieved successfully',
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
    const tenantDomain = req.query.tenantDomain as string;
  
    const result = await categoryServices.getSinigleCategory(tenantDomain, id);

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
    const tenantDomain =
      (req.headers['x-tenant-domain'] as string) ||
      (req.query.tenantDomain as string) ||
      req.headers.host ||
      '';
    const result = await categoryServices.deleteCategory(tenantDomain, id);

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
   const { tenantDomain } = req.body;


    const result = await categoryServices.updateCategory(
      tenantDomain,
      id,
      req.body,
    );

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
