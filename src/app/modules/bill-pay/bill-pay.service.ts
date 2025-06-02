import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TBillPay } from './bill-pay.interface';
import { BillPay } from './bill-pay.model';
import { Supplier } from '../supplier/supplier.model'; // Ensure supplier model is imported
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { supplierSearch } from './bill-pay.const';

const createBillPayIntoDB = async (payload: TBillPay) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!payload.supplierId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Supplier ID is required');
    }


    const existingSupplier = await Supplier.findOne({
      supplierId: payload.supplierId, 
    }).session(session);

    if (!existingSupplier) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
    }

    const sanitizedData = sanitizePayload(payload);

    const [bill] = await BillPay.create(
      [{ ...sanitizedData, supplier: existingSupplier._id }], 
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return bill;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllBillPaysFromDB = async (query: Record<string, unknown>) => {
  const billpayQuery = new QueryBuilder(BillPay.find(), query)
    .search(supplierSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const totalItems = await billpayQuery.countTotal();
  const billPays = await billpayQuery.modelQuery.populate('supplier');

  return {
    meta: { totalItems },
    data: billPays,
  };
};

const getSingleBillPayDetails = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid bill pay ID');
  }

  const singleBillPay = await BillPay.findById(id).populate('supplier');
  if (!singleBillPay) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No bill pay found');
  }

  return singleBillPay;
};

const updateBillPay = async (id: string, payload: Partial<TBillPay>) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid bill pay ID');
  }

  const sanitizedData = sanitizePayload(payload);
  const updatedBillPay = await BillPay.findByIdAndUpdate(
    id,
    { $set: sanitizedData },
    { new: true, runValidators: true },
  );

  if (!updatedBillPay) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Bill pay not updated.');
  }

  return updatedBillPay;
};

const deleteBillPay = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid bill pay ID');
  }

  const billPay = await BillPay.findByIdAndDelete(id);
  if (!billPay) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Bill pay not found.');
  }
};

export const BillPayServices = {
  createBillPayIntoDB,
  getAllBillPaysFromDB,
  getSingleBillPayDetails,
  updateBillPay,
  deleteBillPay,
};
