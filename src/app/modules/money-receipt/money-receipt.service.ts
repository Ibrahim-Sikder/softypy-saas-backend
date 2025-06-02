/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TMoneyReceipt } from './money-receipt.interface';
import { MoneyReceipt } from './money-receipt.model';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import mongoose, { Model } from 'mongoose';
import { Vehicle } from '../vehicle/vehicle.model';
import { SearchableFields } from './money-receipt.const';
import { generateMoneyReceiptId } from './money-receipt.utils';
import { amountInWords } from '../../middlewares/taka-in-words';
import puppeteer from 'puppeteer';
import { join } from 'path';
import ejs from 'ejs';
import { formatToIndianCurrency } from '../quotation/quotation.utils';
import { Invoice } from '../invoice/invoice.model';





const createMoneyReceiptDetails = async (payload: TMoneyReceipt) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      user_type,
      Id,
      chassis_no,
      full_reg_number,
      invoice: invoiceNo,
      job_no,
    } = payload;

    const sanitizeData = sanitizePayload(payload);
    const moneyReceiptId = await generateMoneyReceiptId();

    const totalAmountInWords = amountInWords(
      sanitizeData.total_amount as number,
    );

    const advanceInWords =
      sanitizeData.advance !== undefined
        ? amountInWords(sanitizeData.advance)
        : 'Zero';

    const remainingInWords =
      sanitizeData.remaining !== undefined
        ? amountInWords(sanitizeData.remaining)
        : '';
    //  payment_status based update on against_bill_no_method
    const paymentStatus =
      sanitizeData.against_bill_no_method === 'Final payment against bill no'
        ? 'final'
        : 'advance';
    // create moneyreceipt data
    const moneyReceiptData = new MoneyReceipt({
      ...sanitizeData,
      moneyReceiptId,
      total_amount_in_words: totalAmountInWords,
      advance_in_words: advanceInWords,
      remaining_in_words: remainingInWords,
      payment_status: paymentStatus,
    });

    // Check and associate customer, company, or showroom
    if (user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: Id,
      }).session(session);
      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          { $push: { money_receipts: moneyReceiptData._id } },
          { new: true, session },
        );
        moneyReceiptData.customer = existingCustomer._id;
      }
    } else if (user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: Id,
      }).session(session);
      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          { $push: { money_receipts: moneyReceiptData._id } },
          { new: true, session },
        );
        moneyReceiptData.company = existingCompany._id;
      }
    } else if (user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: Id,
      }).session(session);
      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          { $push: { money_receipts: moneyReceiptData._id } },
          { new: true, session },
        );
        moneyReceiptData.showRoom = existingShowRoom._id;
      }
    }

    // Associate vehicle if chassis_no is provided
    if (chassis_no) {
      const vehicleData = await Vehicle.findOne({ chassis_no });

      if (vehicleData) {
        moneyReceiptData.vehicle = vehicleData._id;
        moneyReceiptData.full_reg_number = full_reg_number;
        await moneyReceiptData.save({ session });
      }
    }
    // calculate invoice and update
    const existingInvoice = await Invoice.findOne({
      $or: [{ invoice_no: invoiceNo }, { job_no }],
    }).session(session);
    if (existingInvoice) {
      const totalAmount = Number(existingInvoice.net_total) || 0;

      const prevAdvance = Number(existingInvoice.advance) || 0;
      const prevDiscount = Number(existingInvoice.discount) || 0;

      const currentPayment =
        sanitizeData.against_bill_no_method === 'Advance against bill no'
          ? Number(sanitizeData.advance) || 0
          : moneyReceiptData?.payment_status === 'final'
            ? Number(existingInvoice.due + existingInvoice.advance) || 0
            : Number(sanitizeData.total_amount);

      const updatedAdvance =
        sanitizeData.against_bill_no_method === 'Advance against bill no'
          ? prevAdvance + currentPayment || 0
          : currentPayment || 0;

      const updatedDue = Math.max(
        totalAmount - updatedAdvance,
        0,
      );

      await Invoice.findByIdAndUpdate(
        existingInvoice._id,
        {
          $push: { moneyReceipts: moneyReceiptData._id },
          $set: {
            advance: updatedAdvance,
            due: updatedDue,
          },
        },
        { new: true, session },
      );

      moneyReceiptData.invoice = existingInvoice._id;
      moneyReceiptData.job_no = existingInvoice.job_no;
    }

    // Save money receipt
    await moneyReceiptData.save({ session });

    await session.commitTransaction();
    session.endSession();
    return moneyReceiptData;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

 const getAllMoneyReceiptsFromDB = async (
  id: string | null,
  limit: number,
  page: number,
  searchTerm: string,
  isRecycled?: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: { [key: string]: any } = {};

  // Filter by ID if provided
  if (id) {
    idMatchQuery = {
      $or: [
        { 'customer._id': new mongoose.Types.ObjectId(id) },
        { 'company._id': new mongoose.Types.ObjectId(id) },
        { 'vehicle._id': new mongoose.Types.ObjectId(id) },
        { 'showRoom._id': new mongoose.Types.ObjectId(id) },
      ],
    };
  }

  // Apply search term filtering if provided
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const moneyReceiptSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ total_amount: Number(searchTerm) }]
      : [];
    const payableAmountCondition = !isNaN(Number(searchTerm))
      ? [{ remaining: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [
        ...moneyReceiptSearchQuery,
        ...amountCondition,
        ...payableAmountCondition,
      ],
    };
  }

  // Handle isRecycled filter
  if (isRecycled !== undefined) {
    searchQuery.isRecycled = isRecycled === 'true';
  }

  // Aggregation pipeline to get filtered money receipts
  const moneyReceipts = await MoneyReceipt.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    { $unwind: { path: '$showRoom', preserveNullAndEmptyArrays: true } },
    { $match: id ? idMatchQuery : {} },
    { $match: searchQuery },
    { $sort: { createdAt: -1 } },
    ...(page && limit
      ? [{ $skip: (page - 1) * limit }, { $limit: limit }]
      : []),
  ]);

  // Group by job_no to calculate total and remaining (from only the first receipt)
  const jobMap: {
    [job_no: string]: { receipts: any[]; totalAmount: number; remaining: number };
  } = {};

  for (const receipt of moneyReceipts) {
    const jobNo = receipt.job_no;

    if (!jobNo) continue;

    if (!jobMap[jobNo]) {
      jobMap[jobNo] = {
        receipts: [],
        totalAmount: 0,
        remaining: 0,
      };
    }

    jobMap[jobNo].receipts.push(receipt);
    jobMap[jobNo].totalAmount += receipt.total_amount || 0;

    // Use only the first receipt's remaining value
    if (jobMap[jobNo].receipts.length === 1) {
      jobMap[jobNo].remaining = receipt.remaining || 0;
    }
  }


  for (const jobNo in jobMap) {
    const { receipts, remaining, totalAmount } = jobMap[jobNo];

    let color = '#2dce89';

    if (remaining > 0 && remaining < totalAmount) {
      color = '#ffad46'; 
    } else if (remaining >= totalAmount) {
      color = '#f5365c';
    }

    receipts.forEach((r) => {
      r.paymentColor = color;
    });
  }

  const totalDataAggregation = await MoneyReceipt.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    { $unwind: { path: '$showRoom', preserveNullAndEmptyArrays: true } },
    { $match: id ? idMatchQuery : {} },
    { $match: searchQuery },
    { $count: 'totalCount' },
  ]);

  const totalData =
    totalDataAggregation.length > 0 ? totalDataAggregation[0].totalCount : 0;
  const totalPages = Math.ceil(totalData / limit);

  return {
    moneyReceipts,
    meta: {
      totalPages,
      currentPage: page,
    },
  };
};


const getSingleMoneyReceiptDetails = async (id: string) => {
  const singleMoneyReceipt =
    await MoneyReceipt.findById(id).populate('vehicle').populate('invoice');

  if (!singleMoneyReceipt) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt found');
  }

  const formattedInvoice = {
    ...singleMoneyReceipt.toObject(),
    total_amount: singleMoneyReceipt.total_amount.toLocaleString('en-IN'),
    advance: singleMoneyReceipt.advance.toLocaleString('en-IN'),
    remaining: singleMoneyReceipt.remaining.toLocaleString('en-IN'),
  };

  return formattedInvoice;
};

const updateMoneyReceiptDetails = async (
  id: string,
  payload: TMoneyReceipt,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user_type, Id, chassis_no, full_reg_number } = payload;

    const sanitizeData = sanitizePayload(payload);

    const totalAmountInWords = amountInWords(
      sanitizeData.total_amount as number,
    );

    const advanceInWords =
      sanitizeData.advance !== undefined
        ? amountInWords(sanitizeData.advance)
        : 'Zero';

    const remainingInWords =
      sanitizeData.remaining !== undefined
        ? amountInWords(sanitizeData.remaining)
        : '';

    const moneyReceiptData = await MoneyReceipt.findByIdAndUpdate(
      id,
      {
        $set: {
          ...sanitizeData,
          total_amount_in_words: totalAmountInWords,
          advance_in_words: advanceInWords,
          remaining_in_words: remainingInWords,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!moneyReceiptData) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not found.');
    }

    // Check if the money receipt is already associated with a customer
    if (user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: Id,
      }).session(session);
      if (existingCustomer) {
        // Check if the receipt is already in the customer's money_receipts
        if (!existingCustomer.money_receipts.includes(moneyReceiptData._id)) {
          await Customer.findByIdAndUpdate(
            existingCustomer._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.customer = existingCustomer._id;
      }
    } else if (user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: Id,
      }).session(session);
      if (existingCompany) {
        // Check if the receipt is already in the company's money_receipts
        if (!existingCompany.money_receipts.includes(moneyReceiptData._id)) {
          await Company.findByIdAndUpdate(
            existingCompany._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.company = existingCompany._id;
      }
    } else if (user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: Id,
      }).session(session);
      if (existingShowRoom) {
        // Check if the receipt is already in the showroom's money_receipts
        if (!existingShowRoom.money_receipts.includes(moneyReceiptData._id)) {
          await ShowRoom.findByIdAndUpdate(
            existingShowRoom._id,
            {
              $push: { money_receipts: moneyReceiptData._id },
            },
            {
              new: true,
              runValidators: true,
              session,
            },
          );
        }
        moneyReceiptData.showRoom = existingShowRoom._id;
      }
    }

    // Update vehicle information if chassis_no is provided
    if (chassis_no) {
      const vehicleData = await Vehicle.findOne({ chassis_no }).session(
        session,
      );
      if (vehicleData) {
        moneyReceiptData.vehicle = vehicleData._id;
        moneyReceiptData.full_reg_number = full_reg_number;
      }
    }

    await moneyReceiptData.save({ session });

    await session.commitTransaction();
    session.endSession();
    return moneyReceiptData;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteMoneyReceipt = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingMoneyReceipt =
      await MoneyReceipt.findById(id).session(session);

    if (!existingMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not available.');
    }

    type UserType = 'customer' | 'company' | 'showRoom';
    type UserMap = {
      [key in UserType]: {
        model: Model<any>;
        queryKey: string;
      };
    };

    const userTypeMap: UserMap = {
      customer: {
        model: Customer,
        queryKey: 'customerId',
      },
      company: {
        model: Company,
        queryKey: 'companyId',
      },
      showRoom: {
        model: ShowRoom,
        queryKey: 'showRoomId',
      },
    };

    const userTypeHandler =
      userTypeMap[existingMoneyReceipt.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingMoneyReceipt.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { money_receipts: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deleteMoneyReceipt = await MoneyReceipt.findByIdAndDelete(
      existingMoneyReceipt._id,
    ).session(session);
    if (!deleteMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt available');
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return null;
};
 const generateMoneyPdf = async (
  id: string,
  imageUrl: string,
): Promise<Buffer> => {
  const money = await MoneyReceipt.findById(id).populate('vehicle');
  if (!money) {
    throw new Error('Money receipt not found');
  }
  let logoBase64 = '';

  console.log(money)
  try {
    const logoUrl = `${imageUrl}/images/logo.png`;
    const logoResponse = await fetch(logoUrl);
    const logoBuffer = await logoResponse.arrayBuffer();
    logoBase64 = Buffer.from(logoBuffer).toString('base64');
  } catch (error) {
    console.warn('Failed to load logo:', error);
  }

  const filePath = join(__dirname, '../../templates/money.ejs');

  const html = await new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      filePath,
      {
        money,
        imageUrl,
        formatToIndianCurrency,
        logoBase64,
      },
      (err, str) => {
        if (err) return reject(err);
        resolve(str);
      },
    );
  });

  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed');
  }
};

const permanantlyDeleteMoneyReceipt = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingMoneyReceipt =
      await MoneyReceipt.findById(id).session(session);

    if (!existingMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not available.');
    }

    type UserType = 'customer' | 'company' | 'showRoom';
    type UserMap = {
      [key in UserType]: {
        model: Model<any>;
        queryKey: string;
      };
    };

    const userTypeMap: UserMap = {
      customer: {
        model: Customer,
        queryKey: 'customerId',
      },
      company: {
        model: Company,
        queryKey: 'companyId',
      },
      showRoom: {
        model: ShowRoom,
        queryKey: 'showRoomId',
      },
    };

    const userTypeHandler =
      userTypeMap[existingMoneyReceipt.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingMoneyReceipt.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { money_receipts: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deleteMoneyReceipt = await MoneyReceipt.findByIdAndDelete(
      existingMoneyReceipt._id,
    ).session(session);
    if (!deleteMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt available');
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return null;
};
const movetoRecyledbinMoneyReceipt = async (id: string) => {
  try {
    const existingMoneyReceipt = await MoneyReceipt.findById(id);

    if (!existingMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not available.');
    }

    const recycledMoneyReceipt = await MoneyReceipt.findByIdAndUpdate(
      existingMoneyReceipt._id,
      {
        isRecycled: true,
        recycledAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!recycledMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt available');
    }

    return recycledMoneyReceipt;
  } catch (error) {
    throw error;
  }
};
const restoreFromRecyledbinMoneyReceipt = async (id: string) => {
  try {
    const existingMoneyReceipt = await MoneyReceipt.findById(id);

    if (!existingMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Money receipt not available.');
    }

    const recycledMoneyReceipt = await MoneyReceipt.findByIdAndUpdate(
      existingMoneyReceipt._id,
      {
        isRecycled: false,
        recycledAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!recycledMoneyReceipt) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No money receipt available');
    }

    return recycledMoneyReceipt;
  } catch (error) {
    throw error;
  }
};
const moveAllToRecycledBin = async () => {
  const result = await MoneyReceipt.updateMany(
    {}, // Match all documents
    {
      $set: {
        isRecycled: true,
        recycledAt: new Date(),
      },
    },
    {
      runValidators: true,
    },
  );

  return result;
};
const restoreAllFromRecycledBin = async () => {
  const result = await MoneyReceipt.updateMany(
    { isRecycled: true },
    {
      $set: {
        isRecycled: false,
      },
      $unset: {
        recycledAt: '',
      },
    },
    {
      runValidators: true,
    },
  );

  return result;
};
const getDueAllMoneyReceipts = async (
  id: string | null,
  limit: number,
  page: number,
  searchTerm: string,
  isRecycled?: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: { [key: string]: any } = {};

  // Filter by ID if provided
  if (id) {
    idMatchQuery = {
      $or: [
        { 'customer._id': new mongoose.Types.ObjectId(id) },
        { 'company._id': new mongoose.Types.ObjectId(id) },
        { 'vehicle._id': new mongoose.Types.ObjectId(id) },
        { 'showRoom._id': new mongoose.Types.ObjectId(id) },
      ],
    };
  }

  // Apply search term filtering if provided
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const moneyReceiptSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const amountCondition = !isNaN(Number(searchTerm))
      ? [{ total_amount: Number(searchTerm) }]
      : [];
    const payableAmountCondition = !isNaN(Number(searchTerm))
      ? [{ remaining: Number(searchTerm) }]
      : [];

    searchQuery = {
      $or: [
        ...moneyReceiptSearchQuery,
        ...amountCondition,
        ...payableAmountCondition,
      ],
    };
  }

  // Handle isRecycled filter
  if (isRecycled !== undefined) {
    searchQuery.isRecycled = isRecycled === 'true';
  }

  // Construct the aggregation pipeline for fetching data
  const moneyReceipts = await MoneyReceipt.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    {
      $unwind: {
        path: '$vehicle',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: id ? idMatchQuery : {}, // Apply id filtering if id exists
    },
    {
      $match: searchQuery, // Apply search term filtering
    },
    {
      $match: { remaining: { $gt: 0 } }, // Filter by remaining > 0
    },
    {
      $sort: { createdAt: -1 },
    },
    ...(page && limit
      ? [{ $skip: (page - 1) * limit }, { $limit: limit }]
      : []),
  ]);

  // Calculate total data count using an aggregation pipeline
  const totalDataAggregation = await MoneyReceipt.aggregate([
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    {
      $unwind: {
        path: '$vehicle',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: id ? idMatchQuery : {}, // Apply id filtering if id exists
    },
    {
      $match: searchQuery, // Apply search term filtering
    },
    {
      $match: { remaining: { $gt: 0 } }, // Filter by remaining > 0
    },
    {
      $count: 'totalCount',
    },
  ]);

  // Extract total data count
  const totalData =
    totalDataAggregation.length > 0 ? totalDataAggregation[0].totalCount : 0;
  const totalPages = Math.ceil(totalData / limit);

  return {
    moneyReceipts,
    meta: {
      totalPages,
      currentPage: page,
    },
  };
};

export const MoneyReceiptServices = {
  createMoneyReceiptDetails,
  getAllMoneyReceiptsFromDB,
  getSingleMoneyReceiptDetails,
  updateMoneyReceiptDetails,
  deleteMoneyReceipt,
  generateMoneyPdf,
  permanantlyDeleteMoneyReceipt,
  restoreFromRecyledbinMoneyReceipt,
  movetoRecyledbinMoneyReceipt,
  moveAllToRecycledBin,
  restoreAllFromRecycledBin,
  getDueAllMoneyReceipts,
};
