import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { leaveRequestServices } from './leave.service';

const createLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    const result = await leaveRequestServices.createLeaveRequest(payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Leave request created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllLeaveRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leaveRequestServices.getAllLeaveRequests(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Leave requests retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leaveRequestsId } = req.params;

    const result = await leaveRequestServices.getSingleLeaveRequest(leaveRequestsId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Leave request retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const employeeLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.query;


    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const result = await leaveRequestServices.employeeLeaveRequest(employeeId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Leave request retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};


const updateLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leaveRequestsId } = req.params;
    const result = await leaveRequestServices.updateLeaveRequest(leaveRequestsId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Leave request updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leaveRequestsId } = req.params;
    const result = await leaveRequestServices.deleteLeaveRequest(leaveRequestsId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Leave request deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const leaveRequestControllers = {
  createLeaveRequest,
  getAllLeaveRequests,
  getSingleLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  employeeLeaveRequest
};
