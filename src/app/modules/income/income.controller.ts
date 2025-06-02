import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IncomeServices } from './income.service';

const createIncome = catchAsync(async (req, res) => {
  const result = await IncomeServices.createIncomeIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income added successful!',
    data: result,
  });
});

const getAllIncomes = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const result = await IncomeServices.getAllIncomesFromDB(limit, page);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Incomes are retrieved successful',
    data: result,
  });
});

const getSingleIncome = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await IncomeServices.getSingleIncomeDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income retrieved successful!',
    data: result,
  });
});

const updateIncome = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await IncomeServices.updateIncome(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income updated successful!',
    data: service,
  });
});
const deleteIncome = catchAsync(async (req, res) => {
  const { id } = req.params;

  const income = await IncomeServices.deleteIncome(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income deleted successful!',
    data: income,
  });
});

export const incomeController = {
  createIncome,
  getAllIncomes,
  getSingleIncome,
  updateIncome,
  deleteIncome,
};
