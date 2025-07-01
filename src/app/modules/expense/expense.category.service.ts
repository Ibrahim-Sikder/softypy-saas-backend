import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { IExpenseCategory } from './expense.interface';
import { getTenantModel } from '../../utils/getTenantModels';

export const getAllExpenseCategories = async (
  tenantDomain: string,
  query: Record<string, unknown>,
): Promise<any> => {
  try {
    const { Model: ExpenseCategory } = await getTenantModel(
      tenantDomain,
      'ExpenseCategory',
    );

    const categorySearchableFields = ['name', 'code'];
    const categoryQuery = new QueryBuilder(ExpenseCategory.find({}), query)
      .search(categorySearchableFields)
      // .filter()
      // .sort()
      .paginate()
      .fields();

    const meta = await categoryQuery.countTotal();
    const result = await categoryQuery.modelQuery;

    return { meta, result };
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error',
    );
  }
};

export const getExpenseCategoryById = async (
  tenantDomain: string,
  id: string,
): Promise<IExpenseCategory | null> => {
  try {
    const { Model: ExpenseCategory } = await getTenantModel(
      tenantDomain,
      'ExpenseCategory',
    );

    await getTenantModel(tenantDomain, 'Expense');

    console.log('Fetching category for tenant:', tenantDomain, 'with ID:', id);

    // Populate the expenses field
    const category = await ExpenseCategory.findOne({ _id: id }).populate('expenses');

    if (!category) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This expense category is not found',
      );
    }

    return category;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error',
    );
  }
};


export const createExpenseCategory = async (
  tenantDomain: string,
  req: Request,
): Promise<IExpenseCategory | null> => {
  try {
    const { Model: ExpenseCategory } = await getTenantModel(
      tenantDomain,
      'ExpenseCategory',
    );

    const { name, code } = req.body;
    const category = await ExpenseCategory.findOne({ name, code });

    if (category) {
      throw new AppError(
        httpStatus.CONFLICT,
        'This expense category already exists',
      );
    }

    const result = await ExpenseCategory.create(req.body);
    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error',
    );
  }
};

export const updateExpenseCategory = async (
  tenantDomain: string,
  id: string,
  req: Request,
): Promise<IExpenseCategory | null> => {
  try {
    const { Model: ExpenseCategory } = await getTenantModel(
      tenantDomain,
      'ExpenseCategory',
    );

    const { ...remainingCategoryData } = req.body;
    const modifiedUpdatedData: Record<string, unknown> = {
      ...remainingCategoryData,
    };

    const result = await ExpenseCategory.findByIdAndUpdate(
      id,
      modifiedUpdatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    return result;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error',
    );
  }
};

export const deleteExpenseCategory = async (
  tenantDomain: string,
  id: string,
): Promise<void | null> => {
  try {
    const { Model: ExpenseCategory } = await getTenantModel(
      tenantDomain,
      'ExpenseCategory',
    );

    const category = await ExpenseCategory.findOne({ _id: id });
    if (!category) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This expense category is not found',
      );
    }

    await ExpenseCategory.findByIdAndDelete(id);

    return null;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Internal Server Error',
    );
  }
};

export const expenseCategoryService = {
  getAllExpenseCategories,
  getExpenseCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
