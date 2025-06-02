import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';
import { ExpenseCategory } from './expense.model';
import { IExpenseCategory } from './expense.interface';

export const getAllExpenseCategories = async (
  query: Record<string, unknown>,
): Promise<any> => {
  try {
    const categorySearchableFields = ['name', 'code'];
    const categoryQuery = new QueryBuilder(ExpenseCategory.find({}), query)
      .search(categorySearchableFields)
      .filter()
      .sort()
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
  id: string,
): Promise<IExpenseCategory | null> => {
  try {
    const category = await ExpenseCategory.findOne({ _id: id }).populate(
      'expenses',
    );
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
  req: Request,
): Promise<IExpenseCategory | null> => {
  try {
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
  id: string,
  req: Request,
): Promise<IExpenseCategory | null> => {
  try {
    const { name, code } = req.body;

    const category = await ExpenseCategory.findOne({ _id: id });
    if (!category) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This expense category does not exist',
      );
    }

    if (name || code) {
      const categoryExists = await ExpenseCategory.findOne({ name, code });
      if (categoryExists) {
        throw new AppError(
          httpStatus.CONFLICT,
          'This expense category already exists',
        );
      }
    }

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
  id: string,
): Promise<void | null> => {
  try {
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
