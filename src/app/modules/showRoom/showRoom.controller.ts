import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ShowRoomServices } from './showRoom.service';

const createShowRoom = catchAsync(async (req, res) => {
  const showRoom = await ShowRoomServices.createShowRoomDetails(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'ShowRoom created successful!',
    data: showRoom,
  });
});

const getAllShowRooms = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10; 
  const page = parseInt(req.query.page as string) || 1; 
  const searchTerm = req.query.searchTerm as string || '';
  const isRecycled = req.query.isRecycled as string; 

  const result = await ShowRoomServices.getAllShowRoomFromDB(
    limit,
    page,
    searchTerm,
    isRecycled, 
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Showrooms retrieved successfully',
    data: result,
  });
});


const getSingleShowRoomDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ShowRoomServices.getSingleShowRoomDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show room retrieved successful!',
    data: result,
  });
});

const updateShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const showRoom = await ShowRoomServices.updatedShowRoom(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Showroom update successful!',
    data: showRoom,
  });
});
const deleteShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ShowRoomServices.deleteShowRoom(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room deleted successful!',
    data: service,
  });
});
const permanantlyDeleteShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ShowRoomServices.permanantlyDeleteShowRoom(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room permanantly deleted successful!',
    data: service,
  });
});
const moveToRecycledbinShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ShowRoomServices.moveToRecycledbinShowRoom(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room move to recycled bin successful!',
    data: service,
  });
});
const restoreFromRecyledbinShowRoom = catchAsync(async (req, res) => {
  const { id } = req.params;

  const service = await ShowRoomServices.restoreFromRecyledbinShowRoom(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Show Room restore successful!',
    data: service,
  });
});
const moveAllToRecycledBinMoneyReceipts = catchAsync(async (req, res) => {
  const result = await ShowRoomServices.moveAllToRecycledBin();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `${result.modifiedCount} company moved to the recycle bin successfully.`,
    data: null,
  });
});
const restoreAllFromRecycledBinMoneyReceipts = catchAsync(async (req, res) => {
  const result = await ShowRoomServices.restoreAllFromRecycledBin();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `${result.modifiedCount} company restored successfully.`,
    data: null,
  });
});
export const showRoomController = {
  createShowRoom,
  getAllShowRooms,
  getSingleShowRoomDetails,
  deleteShowRoom,
  updateShowRoom,
  moveToRecycledbinShowRoom,
  permanantlyDeleteShowRoom,
  restoreFromRecyledbinShowRoom,
  moveAllToRecycledBinMoneyReceipts,
  restoreAllFromRecycledBinMoneyReceipts,
};
