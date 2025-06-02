/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import { categorySearch } from './category.constant';
import { TCategory } from './category.interface';
import { Category } from './category.model';
import path from 'path';
import fs from 'fs'
const createCategory = async (payload: any, file?: Express.Multer.File) => {

  try {
    if (file) {
      const imageName = file.filename;
      const imagePath = path.join(process.cwd(), 'uploads', file.filename);
      const folder = 'category-images';

      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found at path: ${imagePath}`);
      }

      const cloudinaryResult = await ImageUpload(imageName, imagePath, folder);
      payload.image = cloudinaryResult.secure_url;
    }

    if (payload.image && typeof payload.image !== 'string') {
      throw new Error('Invalid image URL format');
    }
    const newCategory = await Category.create(payload);
    return newCategory;
  } catch (error: any) {
    console.error('Error creating category:', error.message);
    throw new Error(error.message || 'An unexpected error occurred while creating the category');
  }
};


const getAllCategory = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Category.find(), query)
    .search(categorySearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const categories = await categoryQuery.modelQuery;

  return {
    meta,
    categories,
  };
};
const getSinigleCategory = async (id: string) => {
  const result = await Category.findById(id);
  return result;
};
const updateCategory = async (id: string, payload: Partial<TCategory>) => {
  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteCategory = async (id: string) => {
  const result = await Category.deleteOne({ _id: id });

  return result;
};

export const categoryServices = {
  createCategory,
  getAllCategory,
  getSinigleCategory,
  updateCategory,
  deleteCategory,
};
