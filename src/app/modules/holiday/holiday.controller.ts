import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { holidayServices } from './holiday.service';

// const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const payload = req.body;
//     const result = await holidayServices.createHoliday(payload);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Holiday created successfully',
//       data: result,
//     });
//   } catch (err: any) {
//     console.error('Error in controller:', err.message);
//     next(err);
//   }
// };

const createHoliday = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;

    const payload = req.body;
    if (payload.data) {
      Object.assign(payload, JSON.parse(payload.data));
      delete payload.data;
    }

    const result = await holidayServices.createHoliday(payload, file);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Holiday created successfully',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in controller:', err.message);
    next(err);
  }
};

const getAllHolidays = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await holidayServices.getAllHolidays(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Holidays retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleHoliday = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { holidayId } = req.params;
    const result = await holidayServices.getSingleHoliday(holidayId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Holiday retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const updateHoliday = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { holidayId } = req.params;
    const result = await holidayServices.updateHoliday(holidayId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Holiday updated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteHoliday = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { holidayId } = req.params;
    const result = await holidayServices.deleteHoliday(holidayId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Holiday deleted successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const holidayControllers = {
  createHoliday,
  getAllHolidays,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
};
