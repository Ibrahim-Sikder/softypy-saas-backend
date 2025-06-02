/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import {
  companyFields,
  customerFields,
  invoiceSearchableFields,
  showRoomFields,
  vehicleFields,
} from './invoice.const';
import { TInvoice } from './invoice.interface';
import { Invoice } from './invoice.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { TVehicle } from '../vehicle/vehicle.interface';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import { Vehicle } from '../vehicle/vehicle.model';
import { Model } from 'mongoose';
import { generateInvoiceNo } from './invoice.utils';
import puppeteer from 'puppeteer';
import { join } from 'path';
import ejs from 'ejs';
import { amountInWords } from '../../middlewares/taka-in-words';
import { formatToIndianCurrency } from '../quotation/quotation.utils';
import { Quotation } from '../quotation/quotation.model';

const createInvoiceDetails = async (payload: {
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  vehicle: TVehicle;
  invoice: TInvoice;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, invoice, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeVehicle = sanitizePayload(vehicle);
    const sanitizeInvoice = sanitizePayload(invoice);

    const invoiceNumber = await generateInvoiceNo();

    const partsInWords = amountInWords(sanitizeInvoice.parts_total as number);
    const serviceInWords = amountInWords(
      sanitizeInvoice.service_total as number,
    );
    const netTotalInWords = amountInWords(sanitizeInvoice.net_total as number);

    const findInvoice = await Invoice.findOne({
      invoice_no: invoice.invoice_no,
    }).session(session);

    if (findInvoice) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Invoice already created by ${invoice.invoice_no}.`,
      );
    }

    // Create invoice data
    const invoiceData = new Invoice({
      ...sanitizeInvoice,
      invoice_no: invoiceNumber,
      parts_total_In_words: partsInWords,
      service_total_in_words: serviceInWords,
      net_total_in_words: netTotalInWords,
    });

    await invoiceData.save({ session });

    // Find the related quotation
    const findQuotation = await Quotation.findOne({
      job_no: invoice.job_no,
    }).session(session);

    if (!findQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found.');
    }

    // Update the quotation status to 'complete' once the invoice is created
    await Quotation.findByIdAndUpdate(
      findQuotation._id,
      { $set: { isCompleted: true, status: 'completed' } },
      { new: true, runValidators: true, session },
    );

    // Handle customer, company, showroom logic (same as before)
    if (invoice.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: invoice.Id,
      }).session(session);

      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
            $push: { invoices: invoiceData._id },
          },
          { new: true, runValidators: true, session },
        );
        invoiceData.customer = existingCustomer._id;
        await invoiceData.save({ session });
      }
    } else if (invoice.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: invoice.Id,
      }).session(session);

      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
            $push: { invoices: invoiceData._id },
          },
          { new: true, runValidators: true, session },
        );
        invoiceData.company = existingCompany._id;
        await invoiceData.save({ session });
      }
    } else if (invoice.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: invoice.Id,
      }).session(session);

      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
            $push: { invoices: invoiceData._id },
          },
          { new: true, runValidators: true, session },
        );
        invoiceData.showRoom = existingShowRoom._id;
        await invoiceData.save({ session });
      }
    }

    // Update vehicle details if necessary
    if (vehicle && vehicle.chassis_no) {
      const vehicleData = await Vehicle.findOneAndUpdate(
        { chassis_no: vehicle.chassis_no },
        { $set: sanitizeVehicle },
        {
          new: true,
          runValidators: true,
          session,
        },
      );
      if (vehicleData) {
        invoiceData.vehicle = vehicleData._id;
        await invoiceData.save({ session });
      }
    }

    // Commit transaction and return the invoice data
    await session.commitTransaction();
    session.endSession();

    return invoiceData;
  } catch (error) {
    // Abort transaction if an error occurs
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllInvoicesFromDB = async (
  id: string | null,
  limit: number,
  page: number,
  searchTerm: string,
  isRecycled?: string,
) => {
  let idMatchQuery: Record<string, unknown> = {};
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

    const quotationSearchQuery = invoiceSearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    const vehicleSearchQuery = vehicleFields.map((field) => {
      if (field === 'vehicle.vehicle_model' && !isNaN(Number(searchTerm))) {
        return { [field]: { $eq: Number(searchTerm) } };
      }
      return { [field]: { $regex: escapedFilteringData, $options: 'i' } };
    });

    const customerSearchQuery = customerFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));
    const companySearchQuery = companyFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));
    const showRoomSearchQuery = showRoomFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [
        ...quotationSearchQuery,
        ...vehicleSearchQuery,
        ...customerSearchQuery,
        ...companySearchQuery,
        ...showRoomSearchQuery,
      ],
    };
  }

  // Handle isRecycled filter
  if (isRecycled !== undefined) {
    searchQuery.isRecycled = isRecycled === 'true';
  }

  // Create a base pipeline for both data and count
  const basePipeline = [
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

    // Apply the same filters to both pipelines
    { $match: id ? idMatchQuery : {} },
    { $match: searchQuery },
  ];

  // Pipeline for fetching data
  const dataPipeline = [
    ...basePipeline,
    // Lookup for MoneyReceipt population based on job_no
    {
      $lookup: {
        from: 'moneyreceipts',
        let: { job_no: '$job_no' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$job_no', '$$job_no'] },
            },
          },
          {
            $project: {
              _id: 0,
              remaining: 1,
              advance: 1,
              total_amount: 1,
            },
          },
        ],
        as: 'moneyReceipts',
      },
    },
    { $sort: { createdAt: -1 as 1 | -1 } },
    ...(page && limit
      ? [{ $skip: (page - 1) * limit }, { $limit: limit }]
      : []),
    {
      $addFields: {
        createdAtFormatted: {
          $cond: {
            if: { $not: ['$createdAt'] },
            then: 'N/A',
            else: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M:%S',
                date: '$createdAt',
              },
            },
          },
        },
      },
    },
  ];

  // Pipeline for counting total documents
  const countPipeline = [...basePipeline, { $count: 'totalCount' }];

  // Execute both pipelines
  const [invoices, totalDataAggregation] = await Promise.all([
    Invoice.aggregate(dataPipeline),
    Invoice.aggregate(countPipeline),
  ]);

  const totalData =
    totalDataAggregation.length > 0 ? totalDataAggregation[0].totalCount : 0;
  const totalPages = Math.ceil(totalData / limit);

  return {
    invoices,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
    },
  };
};

const updateInvoiceIntoDB = async (
  id: string,
  payload: {
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    vehicle: TVehicle;
    invoice: TInvoice;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customer, company, showroom, invoice, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeVehicle = sanitizePayload(vehicle);
    const sanitizeInvoice = sanitizePayload(invoice);

    const partsInWords = amountInWords(sanitizeInvoice.parts_total as number);
    const serviceInWords = amountInWords(
      sanitizeInvoice.service_total as number,
    );
    const netTotalInWords = amountInWords(sanitizeInvoice.net_total as number);

    const updateInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          ...sanitizeInvoice,
          parts_total_In_words: partsInWords,
          service_total_in_words: serviceInWords,
          net_total_in_words: netTotalInWords,
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!updateInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
    }

    if (invoice.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: invoice.Id,
      }).session(session);

      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    } else if (invoice.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: invoice.Id,
      }).session(session);

      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    } else if (invoice.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: invoice.Id,
      }).session(session);

      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    if (vehicle && vehicle.chassis_no) {
      await Vehicle.findOneAndUpdate(
        {
          chassis_no: vehicle.chassis_no,
        },
        {
          $set: sanitizeVehicle,
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );
    }

    await session.commitTransaction();
    session.endSession();
    return updateInvoice;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removeInvoiceFromUpdate = async (
  id: string,
  index: number,
  invoice_name: string,
) => {
  const existingInvoice = await Invoice.findById(id);

  if (!existingInvoice) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice exit.');
  }

  let updateInvoice;

  if (invoice_name === 'parts') {
    updateInvoice = await Invoice.findByIdAndUpdate(
      existingInvoice._id,

      { $pull: { input_data: { $eq: existingInvoice.input_data[index] } } },

      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (invoice_name === 'service') {
    updateInvoice = await Invoice.findByIdAndUpdate(
      existingInvoice._id,

      {
        $pull: {
          service_input_data: {
            $eq: existingInvoice.service_input_data[index],
          },
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (!updateInvoice) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
  }

  return updateInvoice;
};

const getSingleInvoiceDetails = async (id: string) => {
  const singleInvoice = await Invoice.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!singleInvoice) {
    throw new Error('No Invoice found');
  }

  const formattedInvoice = {
    ...singleInvoice.toObject(),
    net_total: singleInvoice.net_total?.toLocaleString('en-IN'),
    due: singleInvoice.due?.toLocaleString('en-IN'),
    service_total: singleInvoice.service_total?.toLocaleString('en-IN'),
    total_amount: singleInvoice.total_amount?.toLocaleString('en-IN'),
    parts_total: singleInvoice.parts_total?.toLocaleString('en-IN'),
  };

  return formattedInvoice;
};
const deleteInvoice = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingInvoice = await Invoice.findById(id).session(session);

    if (!existingInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not available.');
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

    const userTypeHandler = userTypeMap[existingInvoice.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingInvoice.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { invoices: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(
      existingInvoice._id,
    ).session(session);
    if (!deletedInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice available');
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
const permanantlyDeleteInvoice = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingInvoice = await Invoice.findById(id).session(session);

    if (!existingInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not available.');
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

    const userTypeHandler = userTypeMap[existingInvoice.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingInvoice.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { invoices: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(
      existingInvoice._id,
    ).session(session);
    if (!deletedInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice available');
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
const moveToRecycledbinInvoice = async (id: string) => {
  try {
    const existingInvoice = await Invoice.findById(id);

    if (!existingInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not available.');
    }

    const recycledInvoice = await Invoice.findByIdAndUpdate(
      existingInvoice._id,
      {
        isRecycled: true,
        recycledAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!recycledInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice available');
    }

    return recycledInvoice;
  } catch (error) {
    throw error;
  }
};
const restoreFromRecycledbinInvoice = async (id: string) => {
  try {
    const recycledInvoice = await Invoice.findById(id);

    if (!recycledInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Invoice not available.');
    }

    if (!recycledInvoice.isRecycled) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Invoice is not in the recycle bin.',
      );
    }

    const restoredInvoice = await Invoice.findByIdAndUpdate(
      recycledInvoice._id,
      {
        isRecycled: false,
        recycledAt: null,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restoredInvoice) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No invoice available');
    }

    return restoredInvoice;
  } catch (error) {
    throw error;
  }
};
const moveAllToRecycledBin = async () => {
  const result = await Invoice.updateMany(
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
  const result = await Invoice.updateMany(
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
const generateInvoicePDF = async (
  id: string,
  imageUrl: string,
): Promise<Buffer> => {
  const invoice = await Invoice.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');
  console.log(invoice);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  let logoBase64 = '';
  try {
    const logoUrl = `${imageUrl}/images/logo.png`;
    const logoResponse = await fetch(logoUrl);
    const logoBuffer = await logoResponse.arrayBuffer();
    logoBase64 = Buffer.from(logoBuffer).toString('base64');
  } catch (error) {
    console.warn('Failed to load logo:', error);
  }

  const filePath = join(__dirname, '../../templates/invoice.ejs');

  const html = await new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      filePath,
      {
        invoice,
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
export const InvoiceServices = {
  createInvoiceDetails,
  getAllInvoicesFromDB,
  getSingleInvoiceDetails,
  updateInvoiceIntoDB,
  deleteInvoice,
  removeInvoiceFromUpdate,
  generateInvoicePDF,
  moveToRecycledbinInvoice,
  restoreFromRecycledbinInvoice,
  permanantlyDeleteInvoice,
  moveAllToRecycledBin,
  restoreAllFromRecycledBin,
};
