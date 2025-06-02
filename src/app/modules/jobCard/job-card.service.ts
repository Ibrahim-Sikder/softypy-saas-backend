/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Vehicle } from '../vehicle/vehicle.model';
import { TVehicle } from '../vehicle/vehicle.interface';
import { TJobCard } from './job-card.interface';
import { Customer } from '../customer/customer.model';
import { TCustomer } from '../customer/customer.interface';
import { TCompany } from '../company/company.interface';
import { TShowRoom } from '../showRoom/showRoom.interface';
import { JobCard } from './job-card.model';
import { generateCustomerId } from '../customer/customer.utils';
import { generateJobCardNo } from './job-card.utils';
import { SearchableFields, usersFields } from './job-card.const';
import { Company } from '../company/company.model';
import { generateCompanyId } from '../company/company.utils';
import { ShowRoom } from '../showRoom/showRoom.model';
import { generateShowRoomId } from '../showRoom/showRoom.utils';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import { join } from 'path';
import ejs from 'ejs';
const createJobCardDetails = async (payload: {
  jobCard: TJobCard;
  customer: TCustomer;
  company: TCompany;
  showroom: TShowRoom;
  vehicle: TVehicle;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { jobCard, customer, company, showroom, vehicle } = payload;

    let newUserForJobCard;

    const sanitizeCustomerData = sanitizePayload(customer);
    const sanitizeCompanyData = sanitizePayload(company);
    const sanitizeShowRoomData = sanitizePayload(showroom);

    const updateOrCreateUserForJobCard = async (
      userType: string,
      id: string | undefined,
      sanitizedData: any,
      findQuery: any,
      createNewUser: () => any,
    ) => {
      if (id) {
        return await findQuery.findOneAndUpdate(
          { [`${userType}Id`]: id },
          {
            $set: sanitizedData,
          },
          {
            new: true,
            runValidators: true,
            session, // add session to ensure the operation is part of the transaction
          },
        );
      } else {
        return createNewUser();
      }
    };

    switch (jobCard.user_type) {
      case 'customer':
        newUserForJobCard = await updateOrCreateUserForJobCard(
          'customer',
          jobCard.Id,
          sanitizeCustomerData,
          Customer,
          async () => {
            const customerId = await generateCustomerId();
            return new Customer({
              ...sanitizeCustomerData,
              customerId,
              session, // add session to ensure the operation is part of the transaction
            });
          },
        );
        break;
      case 'company':
        newUserForJobCard = await updateOrCreateUserForJobCard(
          'company',
          jobCard.Id,
          sanitizeCompanyData,
          Company,
          async () => {
            const companyId = await generateCompanyId();
            return new Company({
              ...sanitizeCompanyData,
              companyId,
              session, // add session to ensure the operation is part of the transaction
            });
          },
        );
        break;
      case 'showRoom':
        newUserForJobCard = await updateOrCreateUserForJobCard(
          'showRoom',
          jobCard.Id,
          sanitizeShowRoomData,
          ShowRoom,
          async () => {
            const showRoomId = await generateShowRoomId();
            return new ShowRoom({
              ...sanitizeShowRoomData,
              showRoomId,
              session, // add session to ensure the operation is part of the transaction
            });
          },
        );
        break;
      default:
        throw new AppError(StatusCodes.CONFLICT, 'Invalid user type provided');
    }

    const updateJobCard = await newUserForJobCard?.save({ session });

    if (!updateJobCard) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Something went wrong!');
    }

    let vehicleData;

    if (vehicle.chassis_no) {
      const sanitizedVehicleData = sanitizePayload(vehicle);

      const existingVehicle = await Vehicle.findOne(
        { chassis_no: vehicle.chassis_no },
        null,
        { session },
      );

      if (existingVehicle) {
        vehicleData = await Vehicle.findByIdAndUpdate(
          existingVehicle._id,
          {
            $set: sanitizedVehicleData,
          },
          {
            new: true,
            runValidators: true,
            session, // add session to ensure the operation is part of the transaction
          },
        );
      } else {
        vehicleData = new Vehicle({
          ...sanitizedVehicleData,
          user_type: updateJobCard.user_type,
          customer:
            jobCard.user_type === 'customer' ? updateJobCard._id : undefined,
          company:
            jobCard.user_type === 'company' ? updateJobCard._id : undefined,
          showRoom:
            jobCard.user_type === 'showRoom' ? updateJobCard._id : undefined,
        });

        switch (jobCard.user_type) {
          case 'customer':
            vehicleData.customer = updateJobCard._id;
            vehicleData.Id = updateJobCard.customerId;
            break;
          case 'company':
            vehicleData.company = updateJobCard._id;
            vehicleData.Id = updateJobCard.companyId;
            break;
          case 'showRoom':
            vehicleData.showRoom = updateJobCard._id;
            vehicleData.Id = updateJobCard.showRoomId;
            break;
          default:
            throw new AppError(
              StatusCodes.CONFLICT,
              'Invalid user type provided',
            );
        }

        await vehicleData.save({ session });

        updateJobCard.vehicles.push(vehicleData._id);
        await updateJobCard.save({ session });
      }
    }

    const createJobCard = new JobCard({
      ...jobCard,
      vehicle: vehicleData?._id,
      job_no: await generateJobCardNo(),
      customer:
        jobCard.user_type === 'customer' ? updateJobCard._id : undefined,
      company: jobCard.user_type === 'company' ? updateJobCard._id : undefined,
      showRoom:
        jobCard.user_type === 'showRoom' ? updateJobCard._id : undefined,
      Id:
        jobCard.user_type === 'customer'
          ? updateJobCard.customerId
          : jobCard.user_type === 'company'
            ? updateJobCard.companyId
            : jobCard.user_type === 'showRoom'
              ? updateJobCard.showRoomId
              : undefined,
    });

    await createJobCard.save({ session });

    updateJobCard.jobCards.push(createJobCard._id);
    await updateJobCard.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return createJobCard;
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllJobCardsFromDB = async (
  id: string | null,
  limit: number,
  page: number,
  searchTerm: string,
  isRecycled?: string,
) => {
  let idMatchQuery: any = {};
  let searchQuery: { [key: string]: any } = {};

  // If id is provided, filter by the id
  if (id) {
    idMatchQuery = {
      $or: [
        { 'customer._id': new mongoose.Types.ObjectId(id) },
        { 'company._id': new mongoose.Types.ObjectId(id) },
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


    const userSearchQuery = SearchableFields.map((field) => ({
      [field]: { $regex: escapedFilteringData, $options: 'i' },
    }));

    
    // const usersSearchQuery = usersFields.map((field) => ({
    //   [field]: { $regex: escapedFilteringData, $options: 'i' },
    // }));

    const usersSearchQuery = usersFields.map((field) => {
      if (field === 'vehicle.vehicle_model') {
        return { [field]: { $eq: Number(searchTerm) } };
      }
      return { [field]: { $regex: escapedFilteringData, $options: 'i' } };
    });

    searchQuery = {
      $or: [...userSearchQuery, ...usersSearchQuery],
    };
  }

  // Handle isRecycled filter
  if (isRecycled !== undefined) {
    searchQuery.isRecycled = isRecycled === 'true';
  }

  // Construct the aggregation pipeline for fetching data
  const jobCards = await JobCard.aggregate([
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
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    {
      $match: id ? idMatchQuery : {},
    },
    {
      $match: searchQuery,
    },
    {
      $sort: { createdAt: -1 },
    },
    ...(page && limit
      ? [{ $skip: (page - 1) * limit }, { $limit: limit }]
      : []),
  ]);

  // Calculate total data count using aggregation for consistency
  const totalDataAggregation = await JobCard.aggregate([
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
      $match: id ? idMatchQuery : {},
    },
    {
      $match: searchQuery,
    },
    {
      $count: 'totalCount',
    },
  ]);

  // Calculate total data count
  const totalData =
    totalDataAggregation.length > 0 ? totalDataAggregation[0].totalCount : 0;
  const totalPages = Math.ceil(totalData / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return {
    jobCards,
    meta: {
      totalData,
      totalPages,
      currentPage: page,
      pageNumbers,
    },
  };
};

const getSingleJobCardDetails = async (id: string) => {
  const singleJobCard = await JobCard.findById(id)
    .populate({
      path: 'showRoom',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'customer',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'company',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'vehicle',
    });

  if (!singleJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card found');
  }

  return singleJobCard;
};
const getSingleJobCardDetailsWithJobNo = async (jobNo: string) => {
  const singleJobCard = await JobCard.findOne({ job_no: jobNo })
    .populate({
      path: 'showRoom',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'customer',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'company',
      populate: {
        path: 'vehicles',
      },
    })
    .populate({
      path: 'vehicle',
    });

  if (!singleJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card found');
  }

  return singleJobCard;
};

const updateJobCardDetails = async (
  id: string,
  payload: {
    jobCard: TJobCard;
    customer: TCustomer;
    company: TCompany;
    showroom: TShowRoom;
    vehicle: TVehicle;
  },
) => {
  const { jobCard, customer, company, showroom, vehicle } = payload;

  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exist.');
  }

  let newUserForJobCard;

  const sanitizeCustomerData = sanitizePayload(customer);
  const sanitizeCompanyData = sanitizePayload(company);
  const sanitizeShowRoomData = sanitizePayload(showroom);

  if (jobCard.user_type === 'customer') {
    newUserForJobCard = await Customer.findOneAndUpdate(
      { customerId: existingJobCard.Id },
      {
        $set: sanitizeCustomerData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (jobCard.user_type === 'company') {
    newUserForJobCard = await Company.findOneAndUpdate(
      { companyId: existingJobCard.Id },
      {
        $set: sanitizeCompanyData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  if (jobCard.user_type === 'showRoom') {
    newUserForJobCard = await ShowRoom.findOneAndUpdate(
      { showRoomId: existingJobCard.Id },
      {
        $set: sanitizeShowRoomData,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  const updateJobCard = await newUserForJobCard?.save();

  if (!updateJobCard) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Something went wrong!');
  }

  if (vehicle.chassis_no) {
    // Replace the entire mileageHistory array instead of pushing to it
    await Vehicle.findOneAndUpdate(
      { chassis_no: vehicle.chassis_no },
      {
        $set: { mileageHistory: vehicle.mileageHistory || [] },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  const sanitizeJobCard = sanitizePayload(jobCard);

  const updateCard = await JobCard.findByIdAndUpdate(
    existingJobCard._id,
    {
      $set: sanitizeJobCard,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return updateCard;
};

const deleteJobCard = async (id: string) => {
  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exist.');
  }

  if (existingJobCard.user_type === 'customer') {
    await Customer.findOneAndUpdate(
      {
        customerId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'company') {
    await Company.findOneAndUpdate(
      {
        companyId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'showRoom') {
    await ShowRoom.findOneAndUpdate(
      {
        showRoomId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user type');
  }

  const jobCard = await JobCard.findByIdAndDelete(existingJobCard._id);

  if (!jobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card available');
  }

  return null;
};
const permanatlyDeleteJobCard = async (id: string) => {
  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exist.');
  }

  if (existingJobCard.user_type === 'customer') {
    await Customer.findOneAndUpdate(
      {
        customerId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'company') {
    await Company.findOneAndUpdate(
      {
        companyId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else if (existingJobCard.user_type === 'showRoom') {
    await ShowRoom.findOneAndUpdate(
      {
        showRoomId: existingJobCard.Id,
      },
      {
        $pull: { jobCards: existingJobCard._id },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user type');
  }

  const jobCard = await JobCard.findByIdAndDelete(existingJobCard._id);

  if (!jobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card available');
  }

  return null;
};

const movetoRecyclebinJobcard = async (id: string) => {
  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exists.');
  }

  const recycledJobCard = await JobCard.findByIdAndUpdate(
    existingJobCard,
    {
      isRecycled: true,
      recycledAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!recycledJobCard) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Failed to move job card to recycle bin.',
    );
  }

  return recycledJobCard;
};
const restorefromRecyclebinJobcard = async (id: string) => {
  // Check if the job card exists and is in the recycle bin
  const existingJobCard = await JobCard.findById(id);
  if (!existingJobCard) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No job card exists.');
  }

  const restoredJobCard = await JobCard.findByIdAndUpdate(
    existingJobCard,
    {
      isRecycled: false,
      recycledAt: null,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!restoredJobCard) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Failed to restore the job card from the recycle bin.',
    );
  }

  return restoredJobCard;
};

const getUserDetailsForJobCard = async (id: string, userType: string) => {
  let userDetails;

  switch (userType) {
    case 'customer':
      userDetails = await Customer.findOne({ customerId: id }).populate(
        'vehicles',
      );
      if (!userDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found.');
      }
      break;
    case 'company':
      userDetails = await Company.findOne({ companyId: id }).populate(
        'vehicles',
      );
      if (!userDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Company not found.');
      }
      break;
    case 'showRoom':
      userDetails = await ShowRoom.findOne({ showRoomId: id }).populate(
        'vehicles',
      );
      if (!userDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Showroom not found.');
      }
      break;
    default:
      throw new AppError(StatusCodes.NOT_FOUND, 'Invalid user type.');
  }

  return userDetails;
};

export const generateJobCardPdf = async (
  id: string,
  imageUrl: string,
): Promise<Buffer> => {
  const jobcard = await JobCard.findById(id)
    .populate('customer')
    .populate('company')
    .populate('showRoom')
    .populate('vehicle');

  if (!jobcard) {
    throw new Error('jobcard not found');
  }

  // Fetch both logos
  const images = ['logo.png', 'car3.jpeg'];
  const imageBase64Array = await Promise.all(
    images.map(async (imageName) => {
      try {
        const imageResponse = await fetch(`${imageUrl}/images/${imageName}`);
        const imageBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(imageBuffer).toString('base64');
      } catch (error) {
        console.warn(`Failed to load ${imageName}:`, error);
        return '';
      }
    }),
  );

  const filePath = join(__dirname, '../../templates/jobcard.ejs');

  const html = await new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      filePath,
      {
        jobcard,
        imageUrl,
        logoBase64: imageBase64Array[0],
        carImageBase64: imageBase64Array[1],
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

export const JobCardServices = {
  createJobCardDetails,
  getAllJobCardsFromDB,
  getSingleJobCardDetails,
  updateJobCardDetails,
  deleteJobCard,
  getSingleJobCardDetailsWithJobNo,
  generateJobCardPdf,
  getUserDetailsForJobCard,
  movetoRecyclebinJobcard,
  restorefromRecyclebinJobcard,
  permanatlyDeleteJobCard,
};
