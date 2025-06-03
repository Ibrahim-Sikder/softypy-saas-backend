import httpStatus from 'http-status';
import { UserServices } from './user.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createUser = catchAsync(async (req, res) => {
  console.log('submit data console ',req.body);
  const domain =
    (req.headers.origin as string) || (req.headers.host as string) || '';
  const result = await UserServices.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is created successfully',
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const domain =
    (req.headers.origin as string) || (req.headers.host as string) || '';
  const result = await UserServices.getAllUser(domain);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users are retrieved successfully',
    data: result,
  });
});
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUser,
  deleteUser,
};
