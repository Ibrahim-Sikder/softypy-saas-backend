import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { warehouseServices } from './warehouse.service';

const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const result = await warehouseServices.createWarehouse(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Warehouse created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await warehouseServices.getAllWarehouses(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Warehouses retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await warehouseServices.getSingleWarehouse(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Warehouse retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await warehouseServices.updateWarehouse(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Warehouse updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await warehouseServices.deleteWarehouse(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Warehouse deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const warehouseControllers = {
  createWarehouse,
  getAllWarehouses,
  getSingleWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
