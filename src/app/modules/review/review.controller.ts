import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { reviewServices } from './review.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createReview = catchAsync(async (req, res) => {
  const faq = await reviewServices.createreview(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reivew created successful!',
    data: faq,
  });
});



const getAllReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reviewServices.getAllreview(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reivew are retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await reviewServices.updatereview(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reivew update successful!',
    data: service,
  });
});
const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await reviewServices.deletereview(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reivew deleted successful!',
    data: service,
  });
});
const getSingleReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await reviewServices.getSiniglereview(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Review is retrieved succesfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const reviewController = {
  createReview,
  getAllReview,
  updateReview,
  deleteReview,
  getSingleReview
};
