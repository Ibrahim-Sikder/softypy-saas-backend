import type { RequestHandler } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { companyProfileService } from "./companyProfile.service";

const createCompanyProfile: RequestHandler = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;

  const result = await companyProfileService.createCompanyProfile(
    tenantDomain,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Company profile created successfully",
    data: result,
  });
});


const getCompanyProfile: RequestHandler = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;
  const result = await companyProfileService.getCompanyProfile(tenantDomain);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result ? "Company profile retrieved successfully" : "No company profile found",
    data: result,
  });
});



const updateCompanyProfile: RequestHandler = catchAsync(async (req, res) => {
  const tenantDomain = req.query.tenantDomain as string;
  const id = req.params.id; // Expect an ID here since it's an update. If no ID, it should go to create route.

  const result = await companyProfileService.updateCompanyProfile(tenantDomain, id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Company profile updated successfully",
    data: result,
  });
});

export const companyProfileController = {
  getCompanyProfile,
  updateCompanyProfile,
  createCompanyProfile
};