import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEmployeeOvertime } from './overtime.interface';
import EmployeeOvertime from './overtime.model';
import { Employee } from '../employee/employee.model';
import { calculateOvertimeDetails } from './overtime.utils';

const createEmployeeOvertime = async (payload: IEmployeeOvertime) => {
  try {
    // Validate that the employee exists in the system
    const employee = await Employee.findById(payload.employee);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Calculate overtime details
    const { totalHours, estimatedPay } = calculateOvertimeDetails(
      payload.entries,
    );


    // Add the calculated values to the payload
    payload.totalHours = totalHours;
    payload.estimatedPay = estimatedPay;

    // Create the new employee overtime record
    const newEmployeeOvertime = await EmployeeOvertime.create(payload);

    return newEmployeeOvertime;
  } catch (error: any) {
    console.error('Error creating employee overtime:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while creating the employee overtime',
    );
  }
};

const getAllEmployeeOvertimes = async (query: Record<string, unknown>) => {
  const overtimeQuery = new QueryBuilder(EmployeeOvertime.find(), query)
    .search(['employee', 'entries', 'totalHours'])
    .filter()
    .sort()
    .paginate()
    .fields();

  overtimeQuery.modelQuery.populate('employee', 'full_name');

  const meta = await overtimeQuery.countTotal();
  const employeeOvertimes = await overtimeQuery.modelQuery;

  return {
    meta,
    employeeOvertimes,
  };
};

const getSingleEmployeeOvertime = async (overtimeId: string) => {

  if (!Types.ObjectId.isValid(overtimeId)) {
    throw new Error('Invalid overtimeId format');
  }

  const result = await EmployeeOvertime.findById(overtimeId).populate([
    {
      path: 'employee',
      select: 'full_name',
    },
  ]);
  if (!result) {
    throw new Error('Employee overtime not found');
  }

  return result;
};

const updateEmployeeOvertime = async (
  overtimeId: string,
  payload: Partial<IEmployeeOvertime>,
) => {

  try {
    // Validate the overtimeId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(overtimeId)) {
      throw new Error('Invalid overtimeId format');
    }

    // Check if the overtime exists
    const overtimeExists = await EmployeeOvertime.findById(overtimeId);
    if (!overtimeExists) {
      throw new Error('Employee overtime not found');
    }

    // Update the overtime with the validated data
    const updatedOvertime = await EmployeeOvertime.findByIdAndUpdate(
      overtimeId,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    return updatedOvertime;
  } catch (error: any) {
    console.error('Error updating employee overtime:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while updating the employee overtime',
    );
  }
};

const deleteEmployeeOvertime = async (overtimeId: string) => {
  try {
    // Validate the overtimeId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(overtimeId)) {
      throw new Error('Invalid overtimeId format');
    }

    // Check if the overtime exists
    const overtimeExists = await EmployeeOvertime.findById(overtimeId);
    if (!overtimeExists) {
      throw new Error('Employee overtime not found');
    }

    // Proceed to delete the overtime if it exists
    const result = await EmployeeOvertime.deleteOne({ _id: overtimeId });

    return result;
  } catch (error: any) {
    console.error('Error deleting employee overtime:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while deleting the employee overtime',
    );
  }
};

export const employeeOvertimeServices = {
  createEmployeeOvertime,
  getAllEmployeeOvertimes,
  getSingleEmployeeOvertime,
  updateEmployeeOvertime,
  deleteEmployeeOvertime,
};
