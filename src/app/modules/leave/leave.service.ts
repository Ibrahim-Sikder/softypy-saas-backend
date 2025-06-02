import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Employee } from '../employee/employee.model';
import { ILeaveRequest } from './leave.interface';
import LeaveRequest from './leave.model';

const createLeaveRequest = async (payload: ILeaveRequest) => {
  try {
    const employeeExists = await Employee.findById(payload.employee);
    if (!employeeExists) {
      throw new Error('Employee not found');
    }

    const newLeaveRequest = await LeaveRequest.create(payload);
    return newLeaveRequest;
  } catch (error: any) {
    console.error('Error creating leave request:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while creating the leave request',
    );
  }
};

const getAllLeaveRequests = async (query: Record<string, unknown>) => {
  const leaveRequestQuery = new QueryBuilder(
    LeaveRequest.find().populate({
      path: 'employee',
      select: 'full_name',
    }),
    query,
  )
    .search(['status', 'leaveType'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await leaveRequestQuery.countTotal();
  const leaveRequests = await leaveRequestQuery.modelQuery;

  return {
    meta,
    leaveRequests,
  };
};

const getSingleLeaveRequest = async (leaveRequestsId: string) => {
  const result = await LeaveRequest.findById(leaveRequestsId);
  return result;
};
const employeeLeaveRequest = async (employeeId: string) => {

  const result = await LeaveRequest.find();

  return result;
};
const updateLeaveRequest = async (
  leaveRequestId: string,
  payload: Partial<ILeaveRequest>,
) => {
  try {
    // Validate the leaveRequestId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(leaveRequestId)) {
      throw new Error('Invalid leaveRequestId format');
    }

    // Check if the leave request exists
    const leaveRequestExists = await LeaveRequest.findById(leaveRequestId);
    if (!leaveRequestExists) {
      throw new Error('Leave request not found');
    }
    if (payload.employee) {
      const employeeExists = await Employee.findById(payload.employee);
      if (!employeeExists) {
        throw new Error('Employee not found');
      }
    }

    // Update the leave request with the validated data
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    return updatedLeaveRequest;
  } catch (error: any) {
    console.error('Error updating leave request:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while updating the leave request',
    );
  }
};

const deleteLeaveRequest = async (leaveRequestId: string) => {
  try {
    // Validate the leaveRequestId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(leaveRequestId)) {
      throw new Error('Invalid leaveRequestId format');
    }

    // Check if the leave request exists
    const leaveRequestExists = await LeaveRequest.findById(leaveRequestId);
    if (!leaveRequestExists) {
      throw new Error('Leave request not found');
    }

    // Proceed to delete the leave request if it exists
    const result = await LeaveRequest.deleteOne({ _id: leaveRequestId });

    return result;
  } catch (error: any) {
    console.error('Error deleting leave request:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while deleting the leave request',
    );
  }
};

export const leaveRequestServices = {
  createLeaveRequest,
  getAllLeaveRequests,
  getSingleLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  employeeLeaveRequest,
};
