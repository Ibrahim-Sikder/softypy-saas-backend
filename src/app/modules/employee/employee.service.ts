import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { SearchableFields } from './employee.const';
import { TEmployee } from './employee.interface';
import { Employee } from './employee.model';
import { generateEmployeeId } from './employee.utils';
import mongoose from 'mongoose';
import { Attendance } from '../attendance/attendance.model';

const createEmployeeIntoDB = async (payload: TEmployee) => {
  const sanitizeData = sanitizePayload(payload);

  const employeeId = await generateEmployeeId();
  const supplierData = new Employee({
    ...sanitizeData,
    employeeId,
  });

  await supplierData.save();

  return null;
};

// const getAllEmployeesFromDB = async (
//   limit: number,
//   page: number,
//   searchTerm: string,
// ) => {
//   let searchQuery = {};

//   if (searchTerm) {
//     const escapedFilteringData = searchTerm.replace(
//       /[.*+?^${}()|[\]\\]/g,
//       '\\$&',
//     );

//     const employeeSearchQuery = SearchableFields.map((field) => ({
//       [field]: { $regex: escapedFilteringData, $options: 'i' },
//     }));

//     searchQuery = {
//       $or: [...employeeSearchQuery],
//     };
//   }

//   const employees = await Employee.aggregate([
//     {
//       $lookup: {
//         from: 'attendances',
//         localField: 'attendance',
//         foreignField: '_id',
//         as: 'attendance',
//       },
//     },
//     {
//       $lookup: {
//         from: 'salaries', // Name of the salary collection
//         localField: 'salary',
//         foreignField: '_id',
//         as: 'salary',
//       },
//     },
//     {
//       $match: searchQuery,
//     },
//     {
//       $sort: { createdAt: -1 },
//     },
//     {
//       $skip: (page - 1) * limit,
//     },
//     {
//       $limit: limit,
//     },
//   ]);

//   const totalData = await Employee.countDocuments(searchQuery);
//   const totalPages = Math.ceil(totalData / limit);

//   return {
//     employees,
//     meta: {
//       totalPages,
//     },
//   };
// };
const getAllEmployeesFromDB = async (
  limit: number,
  page: number,
  searchTerm: string,
) => {
  // Set default values if limit or page are not provided or invalid
  limit = Number(limit) > 0 ? Number(limit) : 10; // Default limit is 10
  page = Number(page) > 0 ? Number(page) : 1; // Default page is 1

  let searchQuery = {};

  if (searchTerm) {
    const escapedFilteringData = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    const employeeSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    searchQuery = {
      $or: [...employeeSearchQuery],
    };
  }

  const employees = await Employee.aggregate([
    {
      $lookup: {
        from: 'attendances',
        localField: 'attendance',
        foreignField: '_id',
        as: 'attendance',
      },
    },
    {
      $lookup: {
        from: 'salaries',
        localField: 'salary',
        foreignField: '_id',
        as: 'salary',
      },
    },
    {
      $match: searchQuery,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (page - 1) * limit, // Calculated safely
    },
    {
      $limit: limit,
    },
  ]);

  const totalData = await Employee.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalData / limit);

  return {
    employees,
    meta: {
      totalPages,
    },
  };
};

const getSingleEmployeeDetails = async (id: string) => {
  const singleEmployee = await Employee.findById(id)
    .populate('attendance')
    .populate('salary');

  if (!singleEmployee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee found');
  }

  return singleEmployee;
};
const updateEmployeeIntoDB = async (id: string, payload: TEmployee) => {
  const sanitizeData = sanitizePayload(payload);

  const updateEmployee = await Employee.findByIdAndUpdate(
    id,
    {
      $set: sanitizeData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateEmployee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee found');
  }

  return updateEmployee;
};

const deleteEmployee = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);

  if (!employee) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No employee available');
  }

  return null;
};


const permanentlyDeleteEmployee = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const existingEmployee = await Employee.findById(id).session(session);
    if (!existingEmployee) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No employee exists.');
    }

    const attendanceResult = await Attendance.deleteMany(
      { Id: existingEmployee.employeeId },
      { session }
    );

    const employeeResult = await Employee.findByIdAndDelete(
      existingEmployee._id,
      { session }
    );

    if (!employeeResult || attendanceResult.deletedCount === 0) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No employee or attendance found to delete.');
    }
    await session.commitTransaction();

    return employeeResult;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const moveToRecycledEmployee = async (id: string) => {
  try {
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No employee exist.');
    }

    const customer = await Employee.findByIdAndUpdate(
      existingEmployee._id,
      { isRecycled: true, recycledAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!customer) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No employee available');
    }

    return customer;
  } catch (error) {
    throw error;
  }
};
const restoreFromRecycledEmployee = async (id: string) => {
  try {
    const recycledCustomer = await Employee.findById(id);
    if (!recycledCustomer) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No employee exist.');
    }
    const restoredCustomer = await Employee.findByIdAndUpdate(
      recycledCustomer._id,
      { isRecycled: false, recycledAt: null },
      { new: true, runValidators: true },
    );

    if (!restoredCustomer) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'No employee available for restoration.',
      );
    }

    return restoredCustomer;
  } catch (error) {
    throw error;
  }
};
const moveAllToRecycledBin = async () => {
  const result = await Employee.updateMany(
    {}, // Match all documents
    {
      $set: {
        isRecycled: true,
        recycledAt: new Date(),
      },
    },
    {
      runValidators: true,
    }
  );

  return result;
};
const restoreAllFromRecycledBin = async () => {
  const result = await Employee.updateMany(
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
    }
  );

  return result;
};

export const EmployeeServices = {
  createEmployeeIntoDB,
  getAllEmployeesFromDB,
  getSingleEmployeeDetails,
  updateEmployeeIntoDB,
  deleteEmployee,
  permanentlyDeleteEmployee,
  moveToRecycledEmployee,
  restoreFromRecycledEmployee,
  moveAllToRecycledBin,
  restoreAllFromRecycledBin
};
