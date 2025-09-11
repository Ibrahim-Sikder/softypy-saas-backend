/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { Product } from './product.model';
import { TProduct } from './product.interface';
import { productSearch } from './product.constant';
import { getTenantModel } from '../../utils/getTenantModels';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


 const createProduct = async (
  tenantDomain: string,
  payload: any,
  file?: Express.Multer.File
) => {
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  try {
    // Handle file upload
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

    // Create Product
    const newProduct = await Product.create(payload);

    // Link product to suppliers
    if (payload.suppliers && payload.suppliers.length) {
      await Supplier.updateMany(
        { _id: { $in: payload.suppliers } },
        { $push: { products: newProduct._id } }
      );
    }

    return newProduct;
  } catch (error: any) {
    console.error('Error creating product:', error.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || 'An unexpected error occurred while creating the product'
    );
  }
};


const getAllProduct = async (
  tenantDomain: string,
  query: Record<string, any>,
) => {
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');
  const categoryQuery = new QueryBuilder(Product.find(), query)
    .search(productSearch)
    // .filter()
    // .sort()
    // .paginate()
    // .fields();

  const meta = await categoryQuery.countTotal();
  const products = await categoryQuery.modelQuery.populate([
    {
      path: 'category',
      model: (await getTenantModel(tenantDomain, 'Category')).Model,
    },
    {
      path: 'brand',
      model: (await getTenantModel(tenantDomain, 'Brand')).Model,
    },
    { path: 'unit', model: (await getTenantModel(tenantDomain, 'Unit')).Model },
    {
      path: 'product_type',
      model: (await getTenantModel(tenantDomain, 'ProductType')).Model,
    },
    {
      path: 'suppliers',
      model: (await getTenantModel(tenantDomain, 'Supplier')).Model,
    },
    {
      path: 'warehouse',
      model: (await getTenantModel(tenantDomain, 'Warehouse')).Model,
    },
  ]);
  return { meta, products };
};

const getSinigleProduct = async (tenantDomain: string, id: string) => {
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const result = await Product.findById(id).populate([
    {
      path: 'category',
      model: (await getTenantModel(tenantDomain, 'Category')).Model,
    },
    {
      path: 'brand',
      model: (await getTenantModel(tenantDomain, 'Brand')).Model,
    },
    { path: 'unit', model: (await getTenantModel(tenantDomain, 'Unit')).Model },
    {
      path: 'product_type',
      model: (await getTenantModel(tenantDomain, 'ProductType')).Model,
    },
    {
      path: 'suppliers',
      model: (await getTenantModel(tenantDomain, 'Supplier')).Model,
    },
    {
      path: 'warehouse',
      model: (await getTenantModel(tenantDomain, 'Warehouse')).Model,
    },
  ]);

  return result;
};

const updateProduct = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TProduct>,
) => {
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProduct = async (tenantDomain: string, id: string) => {
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');
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
