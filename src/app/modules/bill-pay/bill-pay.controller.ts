import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BillPayServices } from './bill-pay.service';
import httpStatus from 'http-status';

const createBillPay = catchAsync(async (req, res) => {
  const result = await BillPayServices.createBillPayIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Bill pay added successfully!',
    data: result,
  });
});

const getAllBillPays = catchAsync(async (req, res) => {
  const result = await BillPayServices.getAllBillPaysFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bill pays retrieved successfully',
    data: result,
  });
});

const getSingleBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BillPayServices.getSingleBillPayDetails(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay retrieved successfully!',
    data: result,
  });
});

const updateBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedBillPay = await BillPayServices.updateBillPay(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay updated successfully!',
    data: updatedBillPay,
  });
});

const deleteBillPay = catchAsync(async (req, res) => {
  const { id } = req.params;
  await BillPayServices.deleteBillPay(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bill pay deleted successfully!',
    data: undefined
  });
});

export const billPayController = {
  createBillPay,
  getAllBillPays,
  getSingleBillPay,
  updateBillPay,
  deleteBillPay,
};
