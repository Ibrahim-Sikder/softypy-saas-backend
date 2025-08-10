import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { companyBrandServices } from './service';

const createCompanyBrand = catchAsync(async (req, res) => {
  const result = await companyBrandServices.createCompanyBrand(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'CompanyBrand created successfully',
    data: result,
  });
});

const getAllCompanyBrands = catchAsync(async (req, res) => {
  const result = await companyBrandServices.getAllCompanyBrands(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CompanyBrands retrieved successfully',
    data: result,
  });
});

const getSingleCompanyBrand = catchAsync(async (req, res) => {
  const result = await companyBrandServices.getSingleCompanyBrand(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CompanyBrand retrieved successfully',
    data: result,
  });
});

const updateCompanyBrand = catchAsync(async (req, res) => {
  const result = await companyBrandServices.updateCompanyBrand(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CompanyBrand updated successfully',
    data: result,
  });
});

const deleteCompanyBrand = catchAsync(async (req, res) => {
  const result = await companyBrandServices.deleteCompanyBrand(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CompanyBrand deleted successfully',
    data: result,
  });
});

export const companyBrandControllers = {
  createCompanyBrand,
  getAllCompanyBrands,
  getSingleCompanyBrand,
  updateCompanyBrand,
  deleteCompanyBrand,
};
