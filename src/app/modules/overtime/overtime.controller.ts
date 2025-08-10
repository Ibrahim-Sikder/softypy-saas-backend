import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { employeeOvertimeServices } from './overtime.service';
import catchAsync from '../../utils/catchAsync';

const createEmployeeOvertime = catchAsync(async (req, res, next) => {

  try {
    const payload = req.body;
    const {tenantDomain} = req.body;
    const result =
      await employeeOvertimeServices.createEmployeeOvertime(tenantDomain, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee overtime created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
});

const getAllEmployeeOvertimes = catchAsync(async (req, res, next) => {
  const tenantDomain = req.query.tenantDomain as string;
  //  const tenantDomain = req.headers.host || '';
  try {
    const result = await employeeOvertimeServices.getAllEmployeeOvertimes(tenantDomain,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee overtimes retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

const getSingleEmployeeOvertime = catchAsync(async (req, res, next) => {
  const tenantDomain = req.query.tenantDomain as string;
  try {
    const { overtimeId } = req.params;
    const result =
      await employeeOvertimeServices.getSingleEmployeeOvertime(tenantDomain, overtimeId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee overtime retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

const updateEmployeeOvertime = catchAsync(async (req, res, next) => {
  const {tenantDomain} = req.body

  try {
    const { overtimeId } = req.params;
    const result = await employeeOvertimeServices.updateEmployeeOvertime(
      tenantDomain,
      overtimeId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee overtime updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

const deleteEmployeeOvertime = catchAsync(async (req, res, next) => {
  const tenantDomain = req.query.tenantDomain as string;
  try {
    const { overtimeId } = req.params;
    const result =
      await employeeOvertimeServices.deleteEmployeeOvertime(tenantDomain, overtimeId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Employee overtime deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export const employeeOvertimeControllers = {
  createEmployeeOvertime,
  getAllEmployeeOvertimes,
  getSingleEmployeeOvertime,
  updateEmployeeOvertime,
  deleteEmployeeOvertime,
};
