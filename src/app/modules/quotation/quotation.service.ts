/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import {
  companyFields,
  customerFields,
  QuotationSearchableFields,
  showRoomFields,
  vehicleFields,
} from './quotation.const';
import { TQuotation } from './quotation.interface';
import { Quotation } from './quotation.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { Vehicle } from '../vehicle/vehicle.model';
import { formatToIndianCurrency, generateQuotationNo } from './quotation.utils';
import puppeteer from 'puppeteer';
import { join } from 'path';
import ejs from 'ejs';
import { amountInWords } from '../../middlewares/taka-in-words';
import { Stocks } from '../stocks/stocks.model';
import httpStatus from 'http-status';
import { StockTransaction } from '../stockTransaction/stockTransaction.model';
import { Product } from '../product/product.model';

export const createQuotationDetails = async (payload: {
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  quotation: TQuotation;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, company, showroom, quotation, vehicle } = payload;

    // Sanitize input data
    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeQuotation = sanitizePayload(quotation);
    const sanitizeVehicle = sanitizePayload(vehicle);

    // Validate required totals
    if (
      sanitizeQuotation.parts_total === undefined ||
      sanitizeQuotation.service_total === undefined ||
      sanitizeQuotation.net_total === undefined
    ) {
      throw new AppError(400, 'Missing required total values in quotation');
    }

    // Generate quotation number and amount in words
    const quotationNumber = await generateQuotationNo();
    const partsInWords = amountInWords(sanitizeQuotation.parts_total);
    const serviceInWords = amountInWords(sanitizeQuotation.service_total);
    const netTotalInWords = amountInWords(sanitizeQuotation.net_total);

    // Create quotation
    const quotationData = new Quotation({
      ...sanitizeQuotation,
      quotation_no: quotationNumber,
      parts_total_In_words: partsInWords,
      service_total_in_words: serviceInWords,
      net_total_in_words: netTotalInWords,
    });

    await quotationData.save({ session });

    const { input_data = [], service_input_data = [] } = quotation;

    // ✅ Only use `input_data` for stock reduction
    const productItems = input_data.filter(
      (item) => item.product && item.warehouse && item.quantity
    );

    // Prepare stock reduction map
    const stockUpdateMap = new Map<
      string,
      {
        product: string;
        warehouse: string;
        batchNumber?: string;
        totalQuantity: number;
        product_name: string;
        sellingPrice: number;
      }
    >();

    for (const item of productItems) {
      const {
        product,
        quantity = 0,
        warehouse,
        batchNumber,
        product_name,
        sellingPrice = 0,
      } = item;

      const key = `${product}-${warehouse}-${batchNumber || 'no-batch'}`;

      if (stockUpdateMap.has(key)) {
        stockUpdateMap.get(key)!.totalQuantity += quantity;
      } else {
        stockUpdateMap.set(key, {
          product: String(product),
          warehouse,
          batchNumber,
          totalQuantity: quantity,
          product_name,
          sellingPrice,
        });
      }
    }

    // Process stock and product quantity update
    for (const {
      product,
      warehouse,
      batchNumber,
      totalQuantity,
      product_name,
      sellingPrice,
    } of stockUpdateMap.values()) {
      const stockQuery: any = { product, warehouse };
      if (batchNumber) stockQuery.batchNumber = batchNumber;

      const existingStock = await Stocks.findOne(stockQuery).session(session);
      if (!existingStock) {
        throw new AppError(404, `Stock "${product_name}" not found.`);
      }

      if (existingStock.quantity < totalQuantity) {
        throw new AppError(
          400,
          `Insufficient stock for "${product_name}". Available: ${existingStock.quantity}, Required: ${totalQuantity}`
        );
      }

      // Reduce stock quantity
      existingStock.quantity -= totalQuantity;
      await existingStock.save({ session });

      // Create stock transaction
      const stockTransaction = new StockTransaction({
        product,
        warehouse,
        quantity: totalQuantity,
        batchNumber,
        type: 'out',
        referenceType: 'sale',
        referenceId: quotationData._id,
        sellingPrice,
        date: new Date(),
      });

      await stockTransaction.save({ session });

      // Update Product model quantity
      const productData = await Product.findById(product).session(session);
      if (!productData) {
        throw new AppError(404, `Product not found.`);
      }

      if ((productData.product_quantity ?? 0) < totalQuantity) {
        throw new AppError(
          400,
          `Insufficient quantity in product "${product_name}". Available: ${productData.product_quantity}, Required: ${totalQuantity}`
        );
      }

      productData.product_quantity -= totalQuantity;
      productData.lastSoldDate = new Date().toISOString();
      await productData.save({ session });
    }

    // Handle user assignment
    if (quotation.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: quotation.Id,
      }).session(session);

      if (existingCustomer) {
        await Customer.findByIdAndUpdate(
          existingCustomer._id,
          {
            $set: sanitizeCustomer,
            $push: { quotations: quotationData._id },
          },
          { new: true, runValidators: true, session }
        );
        quotationData.customer = existingCustomer._id;
        await quotationData.save({ session });
      }
    } else if (quotation.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: quotation.Id,
      }).session(session);

      if (existingCompany) {
        await Company.findByIdAndUpdate(
          existingCompany._id,
          {
            $set: sanitizeCompany,
            $push: { quotations: quotationData._id },
          },
          { new: true, runValidators: true, session }
        );
        quotationData.company = existingCompany._id;
        await quotationData.save({ session });
      }
    } else if (quotation.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: quotation.Id,
      }).session(session);

      if (existingShowRoom) {
        await ShowRoom.findByIdAndUpdate(
          existingShowRoom._id,
          {
            $set: sanitizeShowroom,
            $push: { quotations: quotationData._id },
          },
          { new: true, runValidators: true, session }
        );
        quotationData.showRoom = existingShowRoom._id;
        await quotationData.save({ session });
      }
    }

    // Vehicle handling
    if (vehicle && vehicle.chassis_no) {
      const vehicleData = await Vehicle.findOneAndUpdate(
        { chassis_no: vehicle.chassis_no },
        { $set: { mileageHistory: vehicle.mileageHistory || [] } },
        { new: true, runValidators: true, session }
      );

      if (vehicleData) {
        quotationData.vehicle = vehicleData._id;
        await quotationData.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return quotationData;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const getAllQuotationsFromDB = async (
  id: string | null,
  limit: number,
  page: number,
  searchTerm: string,
  isRecycled?: string,
  status?: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: { [key: string]: any } = {};

  // If id is provided, filter by the id in customer, company, vehicle, or showRoom
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

  // If a search term is provided, apply regex filtering
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const quotationSearchQuery = QuotationSearchableFields.map((field) => ({
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
  if (status) {
    searchQuery.status = status; // Filter by the status if it is provided
  }
  // Construct the aggregation pipeline for fetching data
  const quotations = await Quotation.aggregate([
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
      $sort: { createdAt: -1 },
    },
    ...(page && limit
      ? [{ $skip: (page - 1) * limit }, { $limit: limit }]
      : []),
  ]);

  // Calculate total data count using an aggregation pipeline for consistency
  const totalDataAggregation = await Quotation.aggregate([
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
      $count: 'totalCount',
    },
  ]);

  // Extract total data count
  const totalData =
    totalDataAggregation.length > 0 ? totalDataAggregation[0].totalCount : 0;
  const totalPages = Math.ceil(totalData / limit);

  return {
    quotations,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
    },
  };
};

const getAllQuotationsFromDBForDashboard = async () => {
  const completedQuotations = await Quotation.find({ isCompleted: true })
    .select('_id')
    .lean();

  return completedQuotations;
};

const getSingleQuotationDetails = async (id: string) => {
  const singleQuotation = await Quotation.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!singleQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found');
  }

  const formattedInvoice = {
    ...singleQuotation.toObject(),
    net_total: singleQuotation.net_total.toLocaleString('en-IN'),

    service_total: singleQuotation.service_total.toLocaleString('en-IN'),
    total_amount: singleQuotation.total_amount.toLocaleString('en-IN'),
    parts_total: singleQuotation.parts_total.toLocaleString('en-IN'),
  };

  return formattedInvoice;
};

const updateQuotationIntoDB = async (
  id: string,
  payload: {
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    quotation: TQuotation;
    vehicle: TVehicle;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, company, showroom, quotation, vehicle } = payload;

    const sanitizeCustomer = sanitizePayload(customer);
    const sanitizeCompany = sanitizePayload(company);
    const sanitizeShowroom = sanitizePayload(showroom);
    const sanitizeQuotation = sanitizePayload(quotation);
    const sanitizeVehicle = sanitizePayload(vehicle);

    const partsInWords = amountInWords(sanitizeQuotation.parts_total as number);
    const serviceInWords = amountInWords(
      sanitizeQuotation.service_total as number,
    );
    const netTotalInWords = amountInWords(
      sanitizeQuotation.net_total as number,
    );

    // ১. পুরানো Quotation নিয়ে আসো
    const oldQuotation = await Quotation.findById(id).session(session);
    if (!oldQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found');
    }

    // ২. পুরানো stockTransaction গুলো নিয়ে আসো এবং stock revert করো (পুরানো কমানো quantity ফেরত দাও)
    const oldStockTransactions = await StockTransaction.find({
      referenceId: id,
      referenceType: 'sale',
    }).session(session);

    for (const tx of oldStockTransactions) {
      const stockQuery: any = {
        product: tx.product,
        warehouse: tx.warehouse,
      };
      if (tx.batchNumber) stockQuery.batchNumber = tx.batchNumber;

      const stock = await Stocks.findOne(stockQuery).session(session);
      if (stock) {
        stock.quantity += tx.quantity; // revert stock quantity
        await stock.save({ session });
      }
    }

    // ৩. পুরানো stockTransaction গুলো মুছে ফেলো
    await StockTransaction.deleteMany({
      referenceId: id,
      referenceType: 'sale',
    }).session(session);

    // ৪. পুরানো quotation update করো
    const updateQuotation = await Quotation.findByIdAndUpdate(
      id,
      {
        $set: {
          ...sanitizeQuotation,
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

    if (!updateQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation found');
    }

    // ৫. নতুন input_data এবং service_input_data থেকে stock update করো (create এর মতোই)
    const { input_data = [], service_input_data = [] } = sanitizeQuotation;
    const allItems = [...input_data, ...service_input_data];

    if (allItems.length > 0) {
      const stockUpdateMap = new Map<
        string,
        {
          product: string;
          warehouse: string;
          batchNumber?: string;
          totalQuantity: number;
          product_name: string;
          sellingPrice: number;
        }
      >();

      for (const item of allItems) {
        const {
          product,
          quantity = 0,
          warehouse,
          batchNumber,
          product_name,
          sellingPrice = 0,
        } = item;

        if (!product || !warehouse) {
          continue;
        }

        const key = `${product}-${warehouse}-${batchNumber || 'no-batch'}`;

        if (stockUpdateMap.has(key)) {
          stockUpdateMap.get(key)!.totalQuantity += quantity;
        } else {
          stockUpdateMap.set(key, {
            product: String(product),
            warehouse,
            batchNumber,
            totalQuantity: quantity,
            product_name,
            sellingPrice,
          });
        }
      }

      for (const {
        product,
        warehouse,
        batchNumber,
        totalQuantity,
        product_name,
        sellingPrice,
      } of stockUpdateMap.values()) {
        const stockQuery: any = { product, warehouse };
        if (batchNumber) stockQuery.batchNumber = batchNumber;

        const existingStock = await Stocks.findOne(stockQuery).session(session);
        if (!existingStock) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            `Stock "${product_name}" not found.`,
          );
        }

        if (existingStock.quantity < totalQuantity) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Insufficient stock for "${product_name}". Available: ${existingStock.quantity}, Required: ${totalQuantity}`,
          );
        }

        // stock থেকে quantity কমাও
        existingStock.quantity -= totalQuantity;
        await existingStock.save({ session });

        // নতুন StockTransaction তৈরি করো
        const stockTransaction = new StockTransaction({
          product,
          warehouse,
          quantity: totalQuantity,
          batchNumber,
          type: 'out',
          referenceType: 'sale',
          referenceId: updateQuotation._id,
          sellingPrice,
          date: new Date(),
        });

        await stockTransaction.save({ session });
      }
    }

    // ৬. যেভাবে create এ করেছিলে তেমনি customer/company/showRoom update করো + vehicle update করো

    if (quotation.user_type === 'customer') {
      const existingCustomer = await Customer.findOne({
        customerId: quotation.Id,
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
    } else if (quotation.user_type === 'company') {
      const existingCompany = await Company.findOne({
        companyId: quotation.Id,
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
    } else if (quotation.user_type === 'showRoom') {
      const existingShowRoom = await ShowRoom.findOne({
        showRoomId: quotation.Id,
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
    return updateQuotation;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removeQuotationFromUpdate = async (
  id: string,
  index: number,
  quotation_name: string,
) => {
  const existingQuotation = await Quotation.findById(id);

  if (!existingQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No quotation exit.');
  }

  let updateQuotation;

  if (quotation_name === 'parts') {
    updateQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,

      { $pull: { input_data: { $eq: existingQuotation.input_data[index] } } },

      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (quotation_name === 'service') {
    updateQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,

      {
        $pull: {
          service_input_data: {
            $eq: existingQuotation.service_input_data[index],
          },
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (!updateQuotation) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No invoice found');
  }

  return updateQuotation;
};

const generateQuotationPdf = async (
  id: string,
  imageUrl: string,
): Promise<Buffer> => {
  const quotation = await Quotation.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!quotation) {
    throw new Error('quotation not found');
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

  const filePath = join(__dirname, '../../templates/quotation.ejs');

  const html = await new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      filePath,
      {
        quotation,
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
      timeout: 60000,
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

const deleteQuotation = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingQuotation = await Quotation.findById(id).session(session);

    if (!existingQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not available.');
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
      userTypeMap[existingQuotation.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingQuotation.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { quotations: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    const deletedQuotation = await Quotation.findByIdAndDelete(
      existingQuotation._id,
    ).session(session);
    if (!deletedQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation available');
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
const permanentlyDeleteQuotation = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingQuotation = await Quotation.findById(id).session(session);

    if (!existingQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not available.');
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
      userTypeMap[existingQuotation.user_type as UserType];
    if (userTypeHandler) {
      const { model, queryKey } = userTypeHandler;
      const existingEntity = await model
        .findOne({ [queryKey]: existingQuotation.Id })
        .session(session);
      if (existingEntity) {
        await model.findByIdAndUpdate(
          existingEntity._id,
          {
            $pull: { quotations: id },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );
      }
    }

    // Delete the quotation
    const deletedQuotation = await Quotation.findByIdAndDelete(
      existingQuotation._id,
    ).session(session);

    if (!deletedQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation available');
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return the deleted quotation
    return deletedQuotation;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const moveToRecyclebinQuotation = async (id: string) => {
  try {
    const existingQuotation = await Quotation.findById(id);

    if (!existingQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not available.');
    }

    const recycledQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,
      {
        isRecycled: true,
        recycledAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!recycledQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No quotation available.');
    }

    return recycledQuotation;
  } catch (error) {
    throw error;
  }
};

const restoreFromRecyclebinQuotation = async (id: string) => {
  try {
    const existingQuotation = await Quotation.findById(id);

    if (!existingQuotation) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Quotation not available.');
    }

    const restoredQuotation = await Quotation.findByIdAndUpdate(
      existingQuotation._id,
      {
        isRecycled: false,
        recycledAt: null,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restoredQuotation) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Failed to restore the quotation.',
      );
    }

    return restoredQuotation;
  } catch (error) {
    throw error;
  }
};
const moveAllToRecycledBin = async () => {
  const result = await Quotation.updateMany(
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
  const result = await Quotation.updateMany(
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

export const QuotationServices = {
  createQuotationDetails,
  getAllQuotationsFromDB,
  getAllQuotationsFromDBForDashboard,
  getSingleQuotationDetails,
  updateQuotationIntoDB,
  deleteQuotation,
  removeQuotationFromUpdate,
  generateQuotationPdf,
  moveToRecyclebinQuotation,
  restoreFromRecyclebinQuotation,
  permanentlyDeleteQuotation,
  restoreAllFromRecycledBin,
  moveAllToRecycledBin,
};
