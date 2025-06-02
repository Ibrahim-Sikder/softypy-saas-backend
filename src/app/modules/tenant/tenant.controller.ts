import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { TenantServices } from './tenant.service';


const createTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { plan } = req.body;
console.log(req.body)
    // Validate the plan value
    if (!['Monthly', 'HalfYearly', 'Yearly'].includes(plan)) {
      throw new Error('Invalid subscription plan. Choose Monthly, HalfYearly, or Yearly.');
    }

    const result = await TenantServices.createTenant(req.body, plan);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Tenant created successfully',
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};
const getAllTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TenantServices.getAllTenant(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Tenants retrieved successfully',
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

const getSingleTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await TenantServices.getSingleTenant(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Tenant retrieved successfully',
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await TenantServices.updateTenant(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Tenant updated successfully',
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

const deleteTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await TenantServices.deleteTenant(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Tenant deleted successfully',
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
};

export const TenantControllers = {
  createTenant,
  getAllTenant,
  getSingleTenant,
  updateTenant,
  deleteTenant,
};
