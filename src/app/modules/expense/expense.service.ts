/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { SearchableFields } from './expense.const';
import { IExpense } from './expense.interface';
import { getTenantModel } from '../../utils/getTenantModels';

const createExpense = async (
  tenantDomain: string,
  payload: any,
  file?: Express.Multer.File,
) => {
  const { Model: Expense } = await getTenantModel(tenantDomain, 'Expense');

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

    const newExpense = await Expense.create(payload);
    return newExpense;
  } catch (error: any) {
    console.error('Error creating expense:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while creating the expense',
    );
  }
};

const getAllExpense = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  const { Model: Expense } = await getTenantModel(tenantDomain, 'Expense');
  const { Model: ExpenseCategory } = await getTenantModel(tenantDomain, 'ExpenseCategory'); 

  const categoryQuery = new QueryBuilder(Expense.find(), query)
    .search(SearchableFields)
    // .filter()
    // .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();

  const expenses = await categoryQuery.modelQuery.populate([
    {
      path: 'category',
      select: 'name',
      model: ExpenseCategory, // ✅ This solves the issue
    },
  ]);

  return {
    meta,
    expenses,
  };
};


const getSinigleExpense = async (tenantDomain: string, id: string) => {
  const { Model: Expense } = await getTenantModel(tenantDomain, 'Expense');

  const result = await Expense.findById(id).populate([
    {
      path: 'category',
      select: 'name',
    },
  ]);

  return result;
};

const updateExpense = async (
  tenantDomain: string,
  id: string,
  payload: Partial<IExpense>,
) => {
  const { Model: Expense } = await getTenantModel(tenantDomain, 'Expense');

  const result = await Expense.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new Error('Expense not found');
  }

  return result;
};

const deleteExpense = async (tenantDomain: string, id: string) => {
  const { Model: Expense } = await getTenantModel(tenantDomain, 'Expense');

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
