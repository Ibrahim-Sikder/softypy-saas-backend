import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { incomeServices } from './income.service';

const createIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;
    const tenantDomain = req.query.tenantDomain as string;

    if (payload.data) {
      Object.assign(payload, JSON.parse(payload.data));
      delete payload.data;
    }

    const result = await incomeServices.createIncome(tenantDomain, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in income controller:', err.message);
    next(err);
  }
};

const getAllIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantDomain = req.query.tenantDomain as string;

    const result = await incomeServices.getAllIncome(tenantDomain, req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Incomes retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const tenantDomain = req.query.tenantDomain as string;

    const result = await incomeServices.getSingleIncome(tenantDomain, id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantDomain = req.query.tenantDomain as string;
    const { id } = req.params;

    const result = await incomeServices.updateIncome(
      tenantDomain,
      id,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const tenantDomain = req.query.tenantDomain as string;

    const result = await incomeServices.deleteIncome(tenantDomain, id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Income deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const incomeControllers = {
  createIncome,
  getAllIncome,
  getSingleIncome,
  updateIncome,
  deleteIncome,
};
