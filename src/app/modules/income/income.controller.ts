import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IncomeServices } from './income.service';

const createIncome = catchAsync(async (req, res) => {
  const {tenantDomain} = req.body
  const result = await IncomeServices.createIncomeIntoDB(tenantDomain, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income added successful!',
    data: result,
  });
});

const getAllIncomes = catchAsync(async (req, res) => {
   const tenantDomain = req.query.tenantDomain as string;
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string);

  const result = await IncomeServices.getAllIncomesFromDB(tenantDomain, limit, page);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Incomes are retrieved successful',
    data: result,
  });
});

const getSingleIncome = catchAsync(async (req, res) => {
   const tenantDomain = req.query.tenantDomain as string;
  const { id } = req.params;

  const result = await IncomeServices.getSingleIncomeDetails(tenantDomain, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income retrieved successful!',
    data: result,
  });
});

const updateIncome = catchAsync(async (req, res) => {
  const { id } = req.params;
  const tenantDomain = req.query.tenantDomain as string

  console.log('update income ', tenantDomain);

  const service = await IncomeServices.updateIncome(tenantDomain, id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Income updated successfully!',
    data: service,
  });
});

const deleteIncome = catchAsync(async (req, res) => {
  const { id } = req.params;
   const tenantDomain = req.query.tenantDomain as string;
  const income = await IncomeServices.deleteIncome(tenantDomain, id);
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
