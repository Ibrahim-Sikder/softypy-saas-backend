/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { Expense } from './expense.model';

import { SearchableFields } from './expense.const';
import { IExpense } from './expense.interface';

const createExpense = async (payload: any, file?: Express.Multer.File) => {
  try {
    if (file) {
      const imageName = file.filename;
      const imagePath = path.join(process.cwd(), 'uploads', file.filename);
      const folder = 'expense-images';

      const cloudinaryResult = await ImageUpload(imagePath, imageName, folder);

      payload.document = cloudinaryResult.secure_url;
    }
    if (payload.document && typeof payload.document !== 'string') {
      throw new Error('Invalid image URL format');
    }

    const newCategory = await Expense.create(payload);
    return newCategory;
  } catch (error: any) {
    console.error('Error creating brand:', error.message);
    throw new Error(
      error.message || 'An unexpected error occurred while creating the brand',
    );
  }
};
const getAllExpense = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Expense.find(), query)
    .search(SearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const expenses = await categoryQuery.modelQuery.populate([
    {
      path: 'category',
      select: 'name',
    },
  ]);

  return {
    meta,
    expenses,
  };
};


const getSinigleExpense = async (id: string) => {
  const result = await Expense.findById(id).populate([
    {
      path: 'category',
      select: 'name',
    },
  ]);
  return result;
};
const updateExpense = async (id: string, payload: Partial<IExpense>) => {
  const result = await Expense.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new Error('Expense not found');
  }
  return result;
};

const deleteExpense = async (id: string) => {
  const result = await Expense.deleteOne({ _id: id });

  return result;
};

export const expenseServices = {
  createExpense,
  getAllExpense,
  getSinigleExpense,
  updateExpense,
  deleteExpense,
};
