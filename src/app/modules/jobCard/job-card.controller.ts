/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { JobCardServices } from './job-card.service';
import { RequestHandler } from 'express';

const createJobCard = catchAsync(async (req, res) => {
  const jobCard = await JobCardServices.createJobCardDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card created successful!',
    data: jobCard,
  });
});

const getAllJobCards = catchAsync(async (req, res) => {
  const id = req.query.id as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);
  const searchTerm = req.query.searchTerm as string;
  const isRecycled = req.query.isRecycled as string;
  const result = await JobCardServices.getAllJobCardsFromDB(
    id,
    limit,
    page,
    searchTerm,
    isRecycled,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job cards are retrieved successful',
    data: result,
  });
});

const getSingleJobCardDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await JobCardServices.getSingleJobCardDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card retrieved successful!',
    data: result,
  });
});
const getSingleJobCardDetailsWithJobNo = catchAsync(async (req, res) => {
  const jobNo = req.query.jobNo as string;

  const result = await JobCardServices.getSingleJobCardDetailsWithJobNo(jobNo);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card retrieved successful!',
    data: result,
  });
});

const updateJobCardDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await JobCardServices.updateJobCardDetails(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card update successful!',
    data: service,
  });
});
const deleteJobCard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const card = await JobCardServices.deleteJobCard(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card deleted successful!',
    data: card,
  });
});
const permanantlyDeleteJobcard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const card = await JobCardServices.deleteJobCard(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card deleted successful!',
    data: card,
  });
});
const movetoRecyclebinJobCard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const card = await JobCardServices.movetoRecyclebinJobcard(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card move to recycle successful!',
    data: card,
  });
});
const restorfromRecyclebinJobCard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const card = await JobCardServices.restorefromRecyclebinJobcard(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Job card move to recycle successful!',
    data: card,
  });
});
const getUserDetailsForJobCard = catchAsync(async (req, res) => {
  const { id, userType } = req.params;

  const card = await JobCardServices.getUserDetailsForJobCard(id, userType);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Get user details for job card successfully!',
    data: card,
  });
});

const generateJobCardPdf: RequestHandler = catchAsync(async (req, res) => {
  const { jobcardId } = req.params;

  const baseUrl = (
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
    'https://api.trustautosolution.com'
  ).replace(/\/$/, '');

  try {
    const pdfBuffer = await JobCardServices.generateJobCardPdf(
      jobcardId,
      baseUrl,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=jobcard-${jobcardId}.pdf`,
    );

    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      status: 'error',
      message:
        error.message || 'An error occurred while generating the jobcard.',
    });
  }
});
export const jobCardController = {
  createJobCard,
  getAllJobCards,
  getSingleJobCardDetails,
  updateJobCardDetails,
  deleteJobCard,
  getSingleJobCardDetailsWithJobNo,
  generateJobCardPdf,
  getUserDetailsForJobCard,
  movetoRecyclebinJobCard,
  restorfromRecyclebinJobCard,
  permanantlyDeleteJobcard,
};
