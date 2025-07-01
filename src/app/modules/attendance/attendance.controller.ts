import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AttendanceServices } from './attendance.service';
const createAttendance = catchAsync(async (req, res) => {
  const { tenantDomain, payload } = req.body;  // extract payload as well

  const result = await AttendanceServices.createAttendanceIntoDB(tenantDomain, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Attendance created successful!",
    data: result,
  });
});


const getTodayAttendance = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;
  const result = await AttendanceServices.getTodayAttendanceFromDB(tenantDomain);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Today attendance retrieved successful!',
    data: result,
  });
});
const getAllAttendanceByCurrentMonth = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const searchTerm = req.query.searchTerm as string;
  const result = await AttendanceServices.getAllAttendanceByCurrentMonth(
    tenantDomain,
    limit,
    page,
    searchTerm,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Current month attendance retrieved successful!',
    data: result,
  });
});

const getSingleDateAttendance = catchAsync(async (req, res) => {
  const { date } = req.params;
  const tenantDomain = req.query.tenantDomain as string;

  const result = await AttendanceServices.getSingleDateAttendance(tenantDomain, date);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance retrieved successful!',
    data: result,
  });
});
const getSingleAttendance = catchAsync(async (req, res) => {
  const { id } = req.params;
const tenantDomain = req.query.tenantDomain as string;
  const result = await AttendanceServices.getSingleAttendance(tenantDomain, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance retrieved successful!',
    data: result,
  });
});

const deleteAttendance = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;
  const result = await AttendanceServices.deleteAttendanceFromDB(tenantDomain ,req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance deleted successful!',
    data: result,
  });
});

export const attendanceController = {
  createAttendance,
  getTodayAttendance,
  getAllAttendanceByCurrentMonth,
  getSingleDateAttendance,
  deleteAttendance,
  getSingleAttendance,
};
