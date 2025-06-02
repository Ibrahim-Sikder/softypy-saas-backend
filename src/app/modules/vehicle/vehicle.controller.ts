import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { VehicleServices } from './vehicle.service';

const createVehicle = catchAsync(async (req, res) => {
  const customer = await VehicleServices.createVehicleDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vehicle created successful!',
    data: customer,
  });
});


// const getAllVehicles = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const result = await VehicleServices.getAllVehiclesFromDB(req.query);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: 'Product are retrieved succesfully',
//       data: result,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


const getAllVehicles = catchAsync(async (req, res) => {
  const id = req.query.id as string;

  // Parse and validate `limit` and `page` with defaults
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10
  const page = parseInt(req.query.page as string) || 1;    // Default to 1

  const searchTerm = req.query.searchTerm as string || '';

  const result = await VehicleServices.getAllVehiclesFromDB(
    id,
    limit,
    page,
    searchTerm,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vehicles retrieved successfully',
    data: result,
  });
});

const getSingleVehicle = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await VehicleServices.getSingleVehicleDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vehicle retrieved successful!',
    data: result,
  });
});

const deleteVehicle = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await VehicleServices.deleteVehicle(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Vehicle deleted successful!',
    data: service,
  });
});

export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getSingleVehicle,
  deleteVehicle,
};
