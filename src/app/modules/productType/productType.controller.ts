import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { productTypeServices } from './productType.service';

const createProductType = async (
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

    const result = await productTypeServices.createProductType(
      tenantDomain,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ProductType created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllProductType = async (
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
    //  const tenantDomain = req.headers.host || '';
    console.log('for get p', tenantDomain);
    const result = await productTypeServices.getAllProductType(
      tenantDomain,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ProductType are retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const getSingleProductType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const tenantDomain = req.query.tenantDomain as string;
    const result = await productTypeServices.getSinigleProductType(
      tenantDomain,
      id,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ProductType is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const deleteProductType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantDomain = req.query.tenantDomain as string;
    const { id } = req.params;
    const result = await productTypeServices.deleteProductType(
      tenantDomain,
      id,
    );

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

const updateProductType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tenantDomain } = req.body;
    const { id } = req.params;
    const result = await productTypeServices.updateProductType(
      tenantDomain,
      id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ProductType update succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const productTypeControllers = {
  getAllProductType,
  getSingleProductType,
  deleteProductType,
  updateProductType,
  createProductType,
};
