import { StatusCodes } from "http-status-codes"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { SalaryServices } from "./salary.service"
import httpStatus from "http-status"
import type { TSalaryFilters } from "./salary.interface"

const createSalary = catchAsync(async (req, res) => {
  const result = await SalaryServices.createSalaryIntoDB(req.body)
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Salary details added successfully!",
    data: result,
  })
})

const addPartialPayment = catchAsync(async (req, res) => {
  const { id: salaryId } = req.params
  const paymentData = {
    ...req.body,
    salaryId,
    created_by: (req as any).user?.id,
  }

  const result = await SalaryServices.addPartialPayment(paymentData)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment added successfully!",
    data: result,
  })
})

const getSalariesForCurrentMonth = catchAsync(async (req, res) => {
  const searchTerm = req.query.searchTerm as string
  const result = await SalaryServices.getSalariesForCurrentMonth(searchTerm)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Salaries retrieved successfully!",
    data: result,
  })
})

const getSingleSalary = catchAsync(async (req, res) => {
  const id = req.query.id as string
  const result = await SalaryServices.getSingleSalary(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Salary retrieved successfully!",
    data: result,
  })
})

const updateSalaryIntoDB = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await SalaryServices.updateSalaryIntoDB(id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Salary updated successfully",
    data: result,
  })
})

const deleteSalaryFromDB = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await SalaryServices.deleteSalaryFromDB(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Salary deleted successfully",
    data: result,
  })
})

const allowedPaymentStatuses = ["completed", "pending", "partial"] as const
type PaymentStatus = (typeof allowedPaymentStatuses)[number]

const getSalariesWithPaymentStatus = catchAsync(async (req, res) => {
  const paymentStatus = req.query.payment_status as string
  const safePaymentStatus = allowedPaymentStatuses.includes(paymentStatus as PaymentStatus)
    ? (paymentStatus as PaymentStatus)
    : undefined

  const filters: TSalaryFilters = {
    searchTerm: req.query.searchTerm as string,
    month: req.query.month as string,
    year: req.query.year as string,
    payment_status: safePaymentStatus,
    page: Number.parseInt(req.query.page as string) || 1,
    limit: Number.parseInt(req.query.limit as string) || 10,
  }

  const result = await SalaryServices.getSalariesWithPaymentStatus(filters)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Salaries with payment status retrieved successfully!",
    data: result,
  })
})

const getPaymentHistory = catchAsync(async (req, res) => {
  const { id: salaryId } = req.params
  const result = await SalaryServices.getSalaryPaymentHistory(salaryId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment history retrieved successfully!",
    data: result,
  })
})

const getSalaryStatistics = catchAsync(async (req, res) => {
  const month = req.query.month as string
  const year = req.query.year as string

  const result = await SalaryServices.getSalaryStatistics(month, year)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Salary statistics retrieved successfully!",
    data: result,
  })
})

const getAllSalaries = catchAsync(async (req, res) => {
  const limit = isNaN(Number(req.query.limit)) ? 10 : Number(req.query.limit)
  const page = isNaN(Number(req.query.page)) ? 1 : Number(req.query.page)
  const searchTerm = req.query.searchTerm as string

  const result = await SalaryServices.getAllSalaries(limit, page, searchTerm)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All salaries retrieved successfully!",
    data: result,
  })
})

// New endpoint to recalculate all salaries (for admin use)
const recalculateAllSalaries = catchAsync(async (req, res) => {
  const result = await SalaryServices.recalculateAllSalaries()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All salaries recalculated successfully!",
    data: result,
  })
})

export const salaryController = {
  createSalary,
  getSalariesForCurrentMonth,
  getSingleSalary,
  updateSalaryIntoDB,
  deleteSalaryFromDB,
  addPartialPayment,
  getSalariesWithPaymentStatus,
  getPaymentHistory,
  getSalaryStatistics,
  getAllSalaries,
  recalculateAllSalaries,
}
