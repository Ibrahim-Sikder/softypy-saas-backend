/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Vehicle } from '../vehicle/vehicle.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { Customer } from '../customer/customer.model';
import { Company } from '../company/company.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { SearchableFields } from './vehicle.const';
const createVehicleDetails = async (payload: TVehicle) => {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // Fetch existing records for customer, company, and showroom
      const [existingCustomer, existingCompany, existingShowroom] =
        await Promise.all([
          Customer.findById(payload.Id).session(session),
          Company.findById(payload.Id).session(session),
          ShowRoom.findById(payload.Id).session(session),
        ]);

      // Ensure that at least one of the entities is found
      if (!existingCustomer && !existingCompany && !existingShowroom) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You are not authorized.');
      }

      // Sanitize the input payload
      const sanitizedData = sanitizePayload(payload);

      // Prepare the vehicle data
      const vehicleData = new Vehicle({
        ...sanitizedData,
        customer: existingCustomer?._id || null,
        company: existingCompany?._id || null,
        showRoom: existingShowroom?._id || null,
        Id:
          existingCustomer?.customerId ||
          existingCompany?.companyId ||
          existingShowroom?.showRoomId ||
          null,
        user_type:
          existingCustomer?.user_type ||
          existingCompany?.user_type ||
          existingShowroom?.user_type ||
          null,
      });

      // Save the vehicle data within the transaction
      const savedVehicle = await vehicleData.save({ session });

      // Associate the saved vehicle with the correct entity based on user_type
      if (savedVehicle) {
        if (savedVehicle.user_type === 'customer' && existingCustomer) {
          await Customer.findByIdAndUpdate(
            existingCustomer._id,
            { $push: { vehicles: savedVehicle._id } },
            { session },
          );
        } else if (savedVehicle.user_type === 'company' && existingCompany) {
          await Company.findByIdAndUpdate(
            existingCompany._id,
            { $push: { vehicles: savedVehicle._id } },
            { session },
          );
        } else if (savedVehicle.user_type === 'showRoom' && existingShowroom) {
          await ShowRoom.findByIdAndUpdate(
            existingShowroom._id,
            { $push: { vehicles: savedVehicle._id } },
            { session },
          );
        }
      }

      return savedVehicle;
    });

    return result;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

const getAllVehiclesFromDB = async (
  id: string,
  limit: number,
  page: number,
  searchTerm: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: any = {};

  // If id is provided, filter by the id
  idMatchQuery = {
    $or: [
      { 'customer._id': new mongoose.Types.ObjectId(id) },
      { 'company._id': new mongoose.Types.ObjectId(id) },
      { 'showRoom._id': new mongoose.Types.ObjectId(id) },
    ],
  };

  // If a search term is provided, apply regex filtering
  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const vehicleSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...vehicleSearchQuery],
    };
  }

  // Construct the aggregation pipeline
  const vehicles = await Vehicle.aggregate([
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
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
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $and: [
          idMatchQuery, // Filter by the provided ID
          searchQuery, // Apply search term filtering
        ],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  // Calculate the total number of documents
  const totalData = await Vehicle.aggregate([
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
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
      $lookup: {
        from: 'showrooms',
        localField: 'showRoom',
        foreignField: '_id',
        as: 'showRoom',
      },
    },
    {
      $unwind: {
        path: '$customer',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$showRoom',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $and: [
          idMatchQuery, // Filter by the provided ID
          searchQuery, // Apply search term filtering
        ],
      },
    },
    {
      $count: 'totalCount',
    },
  ]);

  const totalCount = totalData.length > 0 ? totalData[0].totalCount : 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    vehicles,
    meta: {
      totalPages,
      currentPage: page,
    },
  };
};



const getSingleVehicleDetails = async (id: string) => {
  const singleVehicle = await Vehicle.findById(id);

  if (!singleVehicle) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No vehicle found');
  }

  return singleVehicle;
};

const deleteVehicle = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and delete the vehicle
    const vehicle = await Vehicle.findByIdAndDelete(id, { session });

    if (!vehicle) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No vehicle available');
    }

    // Check and remove vehicle reference from associated customer
    if (vehicle.customer) {
      await Customer.findByIdAndUpdate(
        vehicle.customer,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    // Check and remove vehicle reference from associated company
    if (vehicle.company) {
      await Company.findByIdAndUpdate(
        vehicle.company,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    // Check and remove vehicle reference from associated showroom
    if (vehicle.showRoom) {
      await ShowRoom.findByIdAndUpdate(
        vehicle.showRoom,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return vehicle;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const VehicleServices = {
  createVehicleDetails,
  getAllVehiclesFromDB,
  getSingleVehicleDetails,
  deleteVehicle,
};
