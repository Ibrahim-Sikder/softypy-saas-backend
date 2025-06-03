import { ITenant } from './tenant.interface';
import { Tenant } from './tenant.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { createSubscription } from '../subscription/subscription.service';
import { connectToTenantDatabase } from '../../../server';
import mongoose from 'mongoose';

export const createTenant = async (
  payload: ITenant,
  plan: 'Monthly' | 'HalfYearly' | 'Yearly'
) => {
  console.log(payload)
  try {
    const { name, domain } = payload;

    const existingTenant = await Tenant.findOne({ domain });
    if (existingTenant) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Domain already registered');
    }

    const dbName = domain.replace(/\./g, '_');
    const dbUri = `mongodb+srv://softypy_saas:saas_softypy33@cluster0.ywst3am.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

    const subscription = createSubscription(plan);

    const tenant = new Tenant({
      name,
      domain,
      dbUri,
      subscription,
      isActive: true,
    });

    await tenant.save();

    const connection = await connectToTenantDatabase(tenant._id.toString(), dbUri);
    const DummyModel = connection.model('Dummy', new mongoose.Schema({ name: String }));
    await DummyModel.create({ name: 'trigger' });

    console.log('✅ Tenant created successfully.');
    return tenant;
  } catch (error: any) {
    throw new AppError(500, error.message || 'Error creating tenant');
  }
};

const getAllTenant = async (query: Record<string, unknown>) => {
  const tenantQuery = new QueryBuilder(Tenant.find(), query)
    .search(['naeme'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await tenantQuery.countTotal();
  const tenants = await tenantQuery.modelQuery;

  return { meta, tenants };
};

const getSingleTenant = async (id: string) => {
  const tenant = await Tenant.findById(id);
  if (!tenant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  return tenant;
};

const updateTenant = async (id: string, payload: Partial<ITenant>) => {
  const tenant = await Tenant.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!tenant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenant not found');
  }

  return tenant;
};

const deleteTenant = async (id: string) => {
  const result = await Tenant.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  return { message: 'Tenant deleted successfully' };
};

export const TenantServices = {
  createTenant,
  getAllTenant,
  getSingleTenant,
  updateTenant,
  deleteTenant,
};
