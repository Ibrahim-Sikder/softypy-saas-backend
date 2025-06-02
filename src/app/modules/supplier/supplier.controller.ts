import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';

import sendResponse from '../../utils/sendResponse';
import { supplierServices } from './supplier.service';

export const createSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newSupplier = await supplierServices.createSupplier(req.body);

    return sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier,
    });
  } catch (error: any) {
    console.error('Error in createSupplier controller:', error.message);
    next(error);
  }
};

export const getAllSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const suppliers = await supplierServices.getAllSupplier(req.query);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Suppliers retrieved successfully',
      data: suppliers,
    });
  } catch (error) {
    console.error('Error in getAllSupplier controller:');
    next(error);
  }
};

export const getSingleSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const supplier = await supplierServices.getSingleSupplier(id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier,
    });
  } catch (error: any) {
    console.error('Error in getSingleSupplier controller:', error.message);
    next(error);
  }
};

export const getSupplierProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await supplierServices.getSupplierWithBillPayments(id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Supplier profile retrieved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in getSupplierProfile controller:', error.message);
    next(error);
  }
};
export const updateSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const updatedSupplier = await supplierServices.updateSupplier(id, req.body);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier,
    });
  } catch (error: any) {
    console.error('Error in updateSupplier controller:', error.message);
    next(error);
  }
};

export const permanenatlyDeleteSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await supplierServices.permanenatlyDeleteSupplier(id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    console.error(
      'Error in permanenatlyDeleteSupplier controller:',
      error.message,
    );
    next(error);
  }
};

export const moveToRecycledbinSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await supplierServices.moveToRecycledbinSupplier(id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Supplier moved to recycled bin successfully',
      data: result,
    });
  } catch (error: any) {
    console.error(
      'Error in moveToRecycledbinSupplier controller:',
      error.message,
    );
    next(error);
  }
};

export const restoreFromRecycledSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await supplierServices.restoreFromRecycledSupplier(id);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Supplier restored successfully',
      data: result,
    });
  } catch (error: any) {
    console.error(
      'Error in restoreFromRecycledSupplier controller:',
      error.message,
    );
    next(error);
  }
};
export const supplierController = {
  getAllSupplier,
  getSingleSupplier,
  updateSupplier,
  createSupplier,
  permanenatlyDeleteSupplier,
  moveToRecycledbinSupplier,
  restoreFromRecycledSupplier,
  getSupplierProfile,
};
