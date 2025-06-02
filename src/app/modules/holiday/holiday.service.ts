import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { IHoliday } from './holiday.interface';
import { Holiday } from './holiday.model';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { holidaySearch } from './holiday.constant';
const createHoliday = async (payload: IHoliday, file?: Express.Multer.File) => {

  try {
    if (file) {
      const imageName = file.filename;
      const imagePath = path.join(process.cwd(), 'uploads', file.filename);
      const folder = 'expense-images';

      const cloudinaryResult = await ImageUpload(imagePath, imageName, folder);

      payload.attachments = cloudinaryResult.secure_url;
    }
    if (payload.attachments && typeof payload.attachments !== 'string') {
      throw new Error('Invalid image URL format');
    }
    const newHoliday = await Holiday.create(payload);
    return newHoliday;
  } catch (error: any) {
    console.error('Error creating holiday:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while creating the holiday',
    );
  }
};

const getAllHolidays = async (query: Record<string, unknown>) => {
  const holidayQuery = new QueryBuilder(Holiday.find(), query)
    .search(holidaySearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await holidayQuery.countTotal();
  const holidays = await holidayQuery.modelQuery;

  return {
    meta,
    holidays,
  };
};

const getSingleHoliday = async (holidayId: string) => {
  const result = await Holiday.findById(holidayId);
  return result;
};

const updateHoliday = async (holidayId: string, payload: Partial<IHoliday>) => {
  try {
    // Validate the holidayId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(holidayId)) {
      throw new Error('Invalid holidayId format');
    }

    // Check if the holiday exists
    const holidayExists = await Holiday.findById(holidayId);
    if (!holidayExists) {
      throw new Error('Holiday not found');
    }

    // Update the holiday with the validated data
    const updatedHoliday = await Holiday.findByIdAndUpdate(holidayId, payload, {
      new: true,
      runValidators: true,
    });

    return updatedHoliday;
  } catch (error: any) {
    console.error('Error updating holiday:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while updating the holiday',
    );
  }
};

const deleteHoliday = async (holidayId: string) => {
  try {
    // Validate the holidayId (check if it's a valid ObjectId)
    if (!Types.ObjectId.isValid(holidayId)) {
      throw new Error('Invalid holidayId format');
    }

    // Check if the holiday exists
    const holidayExists = await Holiday.findById(holidayId);
    if (!holidayExists) {
      throw new Error('Holiday not found');
    }

    // Proceed to delete the holiday if it exists
    const result = await Holiday.deleteOne({ _id: holidayId });

    return result;
  } catch (error: any) {
    console.error('Error deleting holiday:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while deleting the holiday',
    );
  }
};

export const holidayServices = {
  createHoliday,
  getAllHolidays,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
};
