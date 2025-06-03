import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Tenant } from '../modules/tenant/tenant.model';
import AppError from '../errors/AppError';
import { connectToTenantDatabase } from '../../server';
import { unitSchema } from '../modules/unit/unit.model';
import { userSchema } from '../modules/user/user.model';
import { brandSchema } from '../modules/brand/brand.model';
import { customerSchema } from '../modules/customer/customer.model';
import { vehicleSchema } from '../modules/vehicle/vehicle.model';
import { addToJobCardSchema } from '../modules/jobCard/job-card.model';
import { quotationSchema } from '../modules/quotation/quotation.model';
import { moneyReceiptSchema } from '../modules/money-receipt/money-receipt.model';
import { invoiceSchema } from '../modules/invoice/invoice.model';

type SchemaMap = {
  [key: string]: mongoose.Schema;
};

const schemas: SchemaMap = {
 User: userSchema,
  Unit: unitSchema,
  Brand: brandSchema,
  Customer: customerSchema,
  Vehicle: vehicleSchema,
  JobCard: addToJobCardSchema,
  Quotation: quotationSchema,
  Invoice: invoiceSchema,
  MoneyReceipt: moneyReceiptSchema,
};

export const getTenantModel = async (
  tenantDomain: string,
  modelName: keyof typeof schemas,
) => {
  console.log(tenantDomain);

  const tenant = await Tenant.findOne({
    domain: { $regex: new RegExp(`^${tenantDomain}$`, 'i') },
  });

  if (!tenant || !tenant.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenant not found or inactive');
  }

  const tenantConnection = await connectToTenantDatabase(
    tenant._id.toString(),
    tenant.dbUri,
  );

  const schema = schemas[modelName];
  if (!schema) {
    throw new Error(`Schema not found for model: ${modelName}`);
  }

  const modelNameStr = String(modelName);
  const Model =
    tenantConnection.models[modelNameStr] ||
    tenantConnection.model(modelNameStr, schema);

  // Add connection to the returned object here
  return { Model, tenant, connection: tenantConnection };
};
