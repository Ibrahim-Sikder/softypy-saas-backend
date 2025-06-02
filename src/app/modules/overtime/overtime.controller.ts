import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { employeeOvertimeServices } from './overtime.service';
import catchAsync from '../../utils/catchAsync';

const createEmployeeOvertime = catchAsync(async (req, res, next) => {
  try {
    const payload = req.body;
    const result =
      await employeeOvertimeServices.createEmployeeOvertime(payload);

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
  try {
    const result = await employeeOvertimeServices.getAllEmployeeOvertimes(
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
  try {
    // Extract the overtimeId from the route parameter
    const { overtimeId } = req.params;

    // Call the service function with the overtimeId
    const result =
      await employeeOvertimeServices.getSingleEmployeeOvertime(overtimeId);

    // Send a successful response with the retrieved data
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

  try {
    const { overtimeId } = req.params;
    const result = await employeeOvertimeServices.updateEmployeeOvertime(
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
  try {
    const { overtimeId } = req.params;
    const result =
      await employeeOvertimeServices.deleteEmployeeOvertime(overtimeId);

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
