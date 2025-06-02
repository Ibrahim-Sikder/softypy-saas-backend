/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { Product } from './product.model';
import { TProduct } from './product.interface';
import { productSearch } from './product.constant';

const createProduct = async (payload: any, file?: Express.Multer.File) => {
  try {
    if (file) {
      const imageName = file.filename;
      const imagePath = path.join(process.cwd(), 'uploads', file.filename);
      const folder = 'brand-images';

      const cloudinaryResult = await ImageUpload(imagePath, imageName, folder);

      payload.image = cloudinaryResult.secure_url;
    }
    if (payload.image && typeof payload.image !== 'string') {
      throw new Error('Invalid image URL format');
    }

    const newCategory = await Product.create(payload);
    return newCategory;
  } catch (error: any) {
    console.error('Error creating brand:', error.message);
    throw new Error(
      error.message || 'An unexpected error occurred while creating the brand',
    );
  }
};

const getAllProduct = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Product.find(), query)
    .search(productSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const products = await categoryQuery.modelQuery.populate([
    {
      path: 'category',
    },
    {
      path: 'brand',
    },
    {
      path: 'unit',
    },
    {
      path: 'product_type',
    },
    {
      path: 'suppliers',
    },
    {
      path: 'warehouse',
    },
  ]);

  return {
    meta,
    products,
  };
};
const getSinigleProduct = async (id: string) => {
  const result = await Product.findById(id).populate([
    {
      path: 'category',
    },
    {
      path: 'brand',
    },
    {
      path: 'unit',
    },
    {
      path: 'product_type',
    },
    {
      path: 'suppliers',
    },
    {
      path: 'warehouse',
    },
  ]);
  return result;
};
const updateProduct = async (id: string, payload: Partial<TProduct>) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProduct = async (id: string) => {
  const result = await Product.deleteOne({ _id: id });

  return result;
};

export const productServices = {
  createProduct,
  getAllProduct,
  getSinigleProduct,
  updateProduct,
  deleteProduct,
};
