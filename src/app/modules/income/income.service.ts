import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

import sanitizePayload from '../../middlewares/updateDataValidation';
import { TIncome } from './income.interface';
import { Income } from './income.model';

const createIncomeIntoDB = async (payload: TIncome) => {
  const sanitizeData = sanitizePayload(payload);
  const expense = await Income.create(sanitizeData);
  return expense;
};

const getAllIncomesFromDB = async (limit: number, page: number) => {
  const searchQuery = {};

  const incomes = await Income.aggregate([
    {
      $match: searchQuery,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  const totalData = await Income.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    incomes,
    meta: {
      totalPages,
    },
  };
};

const getSingleIncomeDetails = async (id: string) => {
  const singleIncome = await Income.findById(id);

  if (!singleIncome) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No income found');
  }

  return singleIncome;
};

const updateIncome = async (id: string, payload: TIncome) => {
  const sanitizedData = sanitizePayload(payload);
  const updatedIncome = await Income.findByIdAndUpdate(
    id,
    {
      $set: sanitizedData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedIncome) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Income not updated.');
  }

  return updatedIncome;
};

const deleteIncome = async (id: string) => {
  const income = await Income.findByIdAndDelete(id);

  if (!income) {
    throw new AppError(StatusCodes.NOT_IMPLEMENTED, 'Income not deleted.');
  }

  return null;
};

export const IncomeServices = {
  createIncomeIntoDB,
  getAllIncomesFromDB,
  getSingleIncomeDetails,
  updateIncome,
  deleteIncome,
};
