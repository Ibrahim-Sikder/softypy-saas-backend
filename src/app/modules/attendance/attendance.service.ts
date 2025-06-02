import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TAttendance } from './attendance.interface';
import { Attendance } from './attendance.model';
import { Employee } from '../employee/employee.model';
import mongoose from 'mongoose';

const createAttendanceIntoDB = async (payload: TAttendance[]) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const attendanceIds = payload.map((entry) => entry.employee);

    for (const id of attendanceIds) {
      const data = payload.find((d) => d.employee === id);

      const existingEmployee = await Employee.findById(id).session(session);

      if (existingEmployee && data) {
        const checkTodaysAttendance = await Attendance.findOneAndUpdate(
          {
            employee: id,
            date: data.date,
          },
          {
            $set: data,
          },
          { session, new: true, runValidators: true },
        );

        if (!checkTodaysAttendance) {
          const attendance = new Attendance({
            ...data,
            employee: existingEmployee._id,
          });

          await attendance.save({ session });

          await Employee.findByIdAndUpdate(
            existingEmployee._id,
            { $push: { attendance: attendance._id } },
            { new: true, runValidators: true, session },
          );
        }
      }
    }

    await session.commitTransaction();
    session.endSession();
    return null;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getTodayAttendanceFromDB = async () => {
  const parsedDate = new Date();
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = parsedDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const todayAttendance = await Attendance.find({ date: formattedDate });

  const presentEntries = todayAttendance.filter(
    (attendance) => attendance.present,
  ).length;

  const presentPercentage = Number(
    (presentEntries / todayAttendance.length) * 100,
  ).toFixed(2);

  const absentEntries = todayAttendance.filter(
    (attendance) => attendance.absent,
  ).length;

  const absentPercentage = Number(
    (absentEntries / todayAttendance.length) * 100,
  ).toFixed(2);
  const lateEntries = todayAttendance.filter(
    (attendance) => attendance.late_status,
  ).length;

  const latePercentage = Number(
    (lateEntries / todayAttendance.length) * 100,
  ).toFixed(2);

  if (!todayAttendance) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No todays attendance found');
  }

  const isIntegerPresentPercentage = presentPercentage.endsWith('.00');

  const finalPresentPercentage = isIntegerPresentPercentage
    ? parseInt(presentPercentage)
    : presentPercentage;
  const isIntegerAbsentPercentage = absentPercentage.endsWith('.00');

  const finalAbsentPercentage = isIntegerAbsentPercentage
    ? parseInt(absentPercentage)
    : absentPercentage;

  const isIntegerLatePercentage = latePercentage.endsWith('.00');

  const finalLatePercentage = isIntegerLatePercentage
    ? parseInt(latePercentage)
    : latePercentage;

  return {
    presentPercentage: finalPresentPercentage,
    presentEntries,
    absentPercentage: finalAbsentPercentage,
    absentEntries,
    latePercentage: finalLatePercentage,
    lateEntries,
    date: formattedDate,
  };
};

const getAllAttendanceByCurrentMonth = async (
  limit: number,
  page: number,
  searchTerm: string,
) => {
  // Get the current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Format month and year to match the date format in the database
  const formattedMonth = currentMonth.toString().padStart(2, '0');
  const formattedYear = currentYear.toString();

  // Create a date pattern to match current month and year
  const datePattern = new RegExp(`^\\d{2}-${formattedMonth}-${formattedYear}$`);

  // Build the query to filter by date pattern and searchTerm if provided
  const query = {
    date: datePattern,
    ...(searchTerm && {
      $or: [
        { date: new RegExp(searchTerm, 'i') },
        { full_name: new RegExp(searchTerm, 'i') },
      ],
    }),
  };

  // Get all distinct dates from the filtered Attendance collection
  const distinctDates = await Attendance.distinct('date', query);

  // Filter the dates to ensure they belong to the current month and year
  const currentMonthDates = distinctDates.filter((date) => {
    const [, month, year] = date.split('-');
    return (
      parseInt(month, 10) === currentMonth && parseInt(year, 10) === currentYear
    );
  });

  // Initialize an array to store attendance results for each date
  const attendanceResults = [];

  // Iterate over each date and calculate the percentages
  for (const date of currentMonthDates) {
    const todayAttendance = await Attendance.find({ date });

    const presentEntries = todayAttendance.filter(
      (attendance) => attendance.present,
    ).length;

    const presentPercentage = Number(
      (presentEntries / todayAttendance.length) * 100,
    ).toFixed(2);

    const absentEntries = todayAttendance.filter(
      (attendance) => attendance.absent,
    ).length;

    const absentPercentage = Number(
      (absentEntries / todayAttendance.length) * 100,
    ).toFixed(2);

    const lateEntries = todayAttendance.filter(
      (attendance) => attendance.late_status,
    ).length;

    const latePercentage = Number(
      (lateEntries / todayAttendance.length) * 100,
    ).toFixed(2);

    if (!todayAttendance.length) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `No attendance found for date: ${date}`,
      );
    }

    const isIntegerPresentPercentage = presentPercentage.endsWith('.00');
    const finalPresentPercentage = isIntegerPresentPercentage
      ? parseInt(presentPercentage)
      : presentPercentage;

    const isIntegerAbsentPercentage = absentPercentage.endsWith('.00');
    const finalAbsentPercentage = isIntegerAbsentPercentage
      ? parseInt(absentPercentage)
      : absentPercentage;

    const isIntegerLatePercentage = latePercentage.endsWith('.00');
    const finalLatePercentage = isIntegerLatePercentage
      ? parseInt(latePercentage)
      : latePercentage;

    // Add the results for the current date to the array
    attendanceResults.push({
      date,
      presentPercentage: finalPresentPercentage,
      presentEntries,
      absentPercentage: finalAbsentPercentage,
      absentEntries,
      latePercentage: finalLatePercentage,
      lateEntries,
    });
  }

  // Implement pagination
  const startIndex = (page - 1) * limit;
  const paginatedResults = attendanceResults.slice(
    startIndex,
    startIndex + limit,
  );

  return {
    totalPages: Math.ceil(attendanceResults.length / limit),
    currentPage: page,
    totalRecords: attendanceResults.length,
    records: paginatedResults,
  };
};

const getSingleAttendance = async (employee: string) => {
  const singleAttendance = await Attendance.find({ employee });

  if (!singleAttendance) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No attendance found');
  }

  return singleAttendance;
};

const getSingleDateAttendance = async (date: string) => {
  const singleAttendance = await Attendance.find({ date });

  if (!singleAttendance) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No attendance found');
  }

  return singleAttendance;
};

const deleteAttendanceFromDB = async (date: { date: string }) => {
  const existingAttendance = await Attendance.find({ date: date.date });

  const attendanceIds = existingAttendance.map((entry) => entry._id);

  attendanceIds.forEach(async (id) => {
    const data = existingAttendance.find((d) => d._id === id);

    const existingEmployee = await Employee.findById(data?.employee);

    if (existingEmployee && data) {
      const checkTodaysAttendance = await Attendance.findByIdAndDelete(id);

      if (checkTodaysAttendance) {
        await Employee.findByIdAndUpdate(
          existingEmployee._id,
          { $pull: { attendance: id } },
          { new: true, runValidators: true },
        );
      }
    }
  });

  return null;
};

export const AttendanceServices = {
  createAttendanceIntoDB,
  getTodayAttendanceFromDB,
  getAllAttendanceByCurrentMonth,
  getSingleDateAttendance,
  deleteAttendanceFromDB,
  getSingleAttendance,
};
