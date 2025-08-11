/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TVehicle } from '../vehicle/vehicle.interface';
import { SearchableFields } from './vehicle.const';
import { getTenantModel } from '../../utils/getTenantModels';

const createVehicleDetails = async (tenantDomain: string, payload: TVehicle) => {
  const { connection, Model: Vehicle } = await getTenantModel(tenantDomain, 'Vehicle');
  const { Model: Customer } = await getTenantModel(tenantDomain, 'Customer');
  const { Model: Company } = await getTenantModel(tenantDomain, 'Company');
  const { Model: ShowRoom } = await getTenantModel(tenantDomain, 'ShowRoom');

  const session = await connection.startSession(); // ✅ Use tenant's connection

  try {
    const result = await session.withTransaction(async () => {
      const [existingCustomer, existingCompany, existingShowroom] = await Promise.all([
        Customer.findById(payload.Id).session(session),
        Company.findById(payload.Id).session(session),
        ShowRoom.findById(payload.Id).session(session),
      ]);

      if (!existingCustomer && !existingCompany && !existingShowroom) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You are not authorized.');
      }

      const sanitizedData = sanitizePayload(payload);

      const vehicleData = new Vehicle({
        ...sanitizedData,
        customer: existingCustomer?._id || null,
        company: existingCompany?._id || null,
        showRoom: existingShowroom?._id || null,
        Id: existingCustomer?.customerId || existingCompany?.companyId || existingShowroom?.showRoomId || null,
        user_type: existingCustomer?.user_type || existingCompany?.user_type || existingShowroom?.user_type || null,
      });

      const savedVehicle = await vehicleData.save({ session });

      if (savedVehicle) {
        if (savedVehicle.user_type === 'customer' && existingCustomer) {
          await Customer.findByIdAndUpdate(existingCustomer._id, { $push: { vehicles: savedVehicle._id } }, { session });
        } else if (savedVehicle.user_type === 'company' && existingCompany) {
          await Company.findByIdAndUpdate(existingCompany._id, { $push: { vehicles: savedVehicle._id } }, { session });
        } else if (savedVehicle.user_type === 'showRoom' && existingShowroom) {
          await ShowRoom.findByIdAndUpdate(existingShowroom._id, { $push: { vehicles: savedVehicle._id } }, { session });
        }
      }

      return savedVehicle;
    });

    return result;
  } finally {
    await session.endSession();
  }
};

const getAllVehiclesFromDB = async (
  tenantDomain: string,
  id: string,
  limit: number,
  page: number,
  searchTerm: string,
) => {
  
  const { Model: Vehicle } = await getTenantModel(tenantDomain, 'Vehicle');

  let idMatchQuery: any = {};
  let searchQuery: any = {}
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
        $and: [idMatchQuery, searchQuery],
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

  // Count total documents
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
        $and: [idMatchQuery, searchQuery],
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

const getSingleVehicleDetails = async (tenantDomain: string, id: string) => {
  console.log(tenantDomain, id)
  const { Model: Vehicle } = await getTenantModel(tenantDomain, 'Vehicle');

  const singleVehicle = await Vehicle.findById(id);
  console.log(singleVehicle)

  if (!singleVehicle) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No vehicle found');
  }

  return singleVehicle;
};

const deleteVehicle = async (tenantDomain: string, id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Model: Vehicle } = await getTenantModel(tenantDomain, 'Vehicle');
    const { Model: Customer } = await getTenantModel(tenantDomain, 'Customer');
    const { Model: Company } = await getTenantModel(tenantDomain, 'Company');
    const { Model: ShowRoom } = await getTenantModel(tenantDomain, 'ShowRoom');

    // Find and delete the vehicle
    const vehicle = await Vehicle.findByIdAndDelete(id, { session });

    if (!vehicle) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No vehicle available');
    }

    // Remove reference from customer if exists
    if (vehicle.customer) {
      await Customer.findByIdAndUpdate(
        vehicle.customer,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    // Remove reference from company if exists
    if (vehicle.company) {
      await Company.findByIdAndUpdate(
        vehicle.company,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    // Remove reference from showroom if exists
    if (vehicle.showRoom) {
      await ShowRoom.findByIdAndUpdate(
        vehicle.showRoom,
        { $pull: { vehicles: vehicle._id } },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return vehicle;
  } catch (error) {
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
