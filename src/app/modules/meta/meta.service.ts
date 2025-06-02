import QueryBuilder from '../../builder/QueryBuilder';
import { Company } from '../company/company.model';
import { Customer } from '../customer/customer.model';
import { Invoice } from '../invoice/invoice.model';
import { JobCard } from '../jobCard/job-card.model';
import LeaveRequest from '../leave/leave.model';
import { MoneyReceipt } from '../money-receipt/money-receipt.model';
import { Quotation } from '../quotation/quotation.model';
import { ShowRoom } from '../showRoom/showRoom.model';
import { buildSearchQuery } from './meta.search';

const formatToBDComma = (number: number) => {
  return number.toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

const getAllCustomer = async (query: Record<string, unknown>) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  let searchTerm = query.searchTerm as string;

  if (searchTerm) {
    searchTerm = searchTerm.trim();
    if (searchTerm.startsWith('+')) {
      searchTerm = searchTerm.substring(1).trim();
    }
  }

  // Define searchable fields for each model
  const customerSearchFields = [
    'customerId',
    'customer_name',
    'customer_contact',
    'customer_address',
    'driver_name',
    'driver_contact',
    'vehicle_username',
    'reference_name',
    'user_type',
    'contact',
    'fullCustomerNum',
    'fullRegNums',
  ];

  const companySearchFields = [
    'companyId',
    'company_name',
    'company_contact',
    'company_address',
    'driver_name',
    'driver_contact',
    'vehicle_username',
    'reference_name',
    'user_type',
    'contact',
    'fullCompanyNum',
    'fullRegNums',
  ];
  const showroomSearchFields = [
    'showRoomId',
    'showRoom_name',
    'company_contact',
    'showRoom_address',
    'driver_name',
    'driver_contact',
    'vehicle_username',
    'reference_name',
    'user_type',
    'contact',
    'fullCompanyNum',
    'fullRegNums',
  ];

  const vehicleSearchFields = [
    'vehicles.fullRegNum',
    'vehicles.car_registration_no',
  ];

  const allSearchFields = [
    ...customerSearchFields,
    ...companySearchFields,
    ...showroomSearchFields,
    ...vehicleSearchFields,
  ];

  const searchQuery = buildSearchQuery(allSearchFields, searchTerm);

  // Create queries
  const customerQuery = new QueryBuilder(
    Customer.find(searchQuery),
    query,
  ).filter();
  const companyQuery = new QueryBuilder(
    Company.find(searchQuery),
    query,
  ).filter();
  const showroomQuery = new QueryBuilder(
    ShowRoom.find(searchQuery),
    query,
  ).filter();

  const [customerCount, companyCount, showroomCount] = await Promise.all([
    customerQuery.countTotal(),
    companyQuery.countTotal(),
    showroomQuery.countTotal(),
  ]);

  const populateOptions = {
    path: 'vehicles',
    select: 'fullRegNum car_registration_no',
  };

  const [customers, companies, showrooms] = await Promise.all([
    customerQuery.modelQuery
      .populate('quotations')
      .populate('jobCards')
      .populate(populateOptions)
      .lean(),
    companyQuery.modelQuery
      .populate('quotations')
      .populate('jobCards')
      .populate(populateOptions)
      .lean(),
    showroomQuery.modelQuery
      .populate('quotations')
      .populate('jobCards')
      .populate(populateOptions)
      .lean(),
  ]);

  // Unified data creation
  const unifiedData = [
    ...customers.map((customer) => ({
      _id: customer._id,
      id: customer.customerId,
      userType: customer.user_type,
      name: customer.customer_name,
      vehicles: customer.vehicles,
      jobCards: customer.jobCards,
      quotations: customer.quotations,
      invoices: customer.invoices,
      moneyReceipts: customer.money_receipts,
      address: customer.customer_address,
      contact: customer.fullCustomerNum,
      countryCode: customer.customer_country_code,
      email: customer.customer_email,
      driverName: customer.driver_name,
      driverContact: customer.driver_contact,
      driverCountryCode: customer.driver_country_code,
      vehicle_username: customer.vehicle_username,
      referenceName: customer.reference_name,
      isRecycled: customer.isRecycled,
      recycledAt: customer.recycledAt,
      searchableId: customer.customerId,
      searchableName: customer.customer_name,
      searchableContact: `${customer.customer_country_code}${customer.customer_contact}`,
      searchableVehicle: customer.vehicles
        .map((v: any) => v.fullRegNum)
        .join(', '),
      fullRegNums: customer.vehicles.map((v: any) => v.fullRegNum).join(', '),
      type: 'customer',
    })),
    ...companies.map((company) => ({
      _id: company._id,
      id: company.companyId,
      userType: company.user_type,
      name: company.company_name,
      vehicles: company.vehicles,
      jobCards: company.jobCards,
      quotations: company.quotations,
      invoices: company.invoices,
      vehicle_username: company.vehicle_username,
      moneyReceipts: company.money_receipts,
      address: company.company_address,
      contact: company.fullCompanyNum,
      countryCode: company.company_country_code,
      email: company.company_email,
      driverName: company.driver_name,
      driverContact: company.driver_contact,
      driverCountryCode: company.driver_country_code,
      referenceName: company.reference_name,
      isRecycled: company.isRecycled,
      recycledAt: company.recycledAt,
      searchableId: company.companyId,
      searchableName: company.company_name,
      searchableContact: `${company.company_country_code}${company.company_contact}`,
      searchableVehicle: company.vehicles
        .map((v: any) => v.fullRegNum)
        .join(', '),
      fullRegNums: company.vehicles.map((v: any) => v.fullRegNum).join(', '),
      type: 'company',
    })),
    ...showrooms.map((showroom) => ({
      _id: showroom._id,
      id: showroom.showRoomId,
      userType: showroom.user_type,
      name: showroom.showRoom_name,
      vehicles: showroom.vehicles,
      jobCards: showroom.jobCards,
      quotations: showroom.quotations,
      invoices: showroom.invoices,
      moneyReceipts: showroom.money_receipts,
      address: showroom.showRoom_address,
      contact: showroom.fullCompanyNum,
      vehicle_username: showroom.vehicle_username,
      countryCode: showroom.company_country_code,
      email: showroom.company_email,
      driverName: showroom.driver_name,
      driverContact: showroom.driver_contact,
      driverCountryCode: showroom.driver_country_code,
      referenceName: showroom.reference_name,
      isRecycled: showroom.isRecycled,
      recycledAt: showroom.recycledAt,
      searchableId: showroom.showRoomId,
      searchableName: showroom.showRoom_name,
      searchableContact: `${showroom.company_country_code}${showroom.company_contact}`,
      searchableVehicle: showroom.vehicles
        .map((v: any) => v.fullRegNum)
        .join(', '),
      fullRegNums: showroom.vehicles.map((v: any) => v.fullRegNum).join(', '),
      type: 'showroom',
    })),
  ];

  // Apply sorting
  const sortedData = unifiedData.sort((a, b) => {
    if (query.sort === 'asc') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  // Apply pagination
  const paginatedData = sortedData.slice(skip, skip + limit);

  return {
    meta: {
      page,
      limit,
      total: sortedData.length,
      totalPage: Math.ceil(sortedData.length / limit),
    },
    data: paginatedData,
  };
};

const getAllMetaFromDB = async (query: Record<string, unknown>) => {
  const allCustomer = await Customer.find({ isRecycled: false });
  const allCompany = await Company.find({ isRecycled: false });
  const allShowRoom = await ShowRoom.find({ isRecycled: false });
  const totalJobCard = await JobCard.find({ isRecycled: false });
  const totalQuotation = await Quotation.find({ isRecycled: false });
  const totalInvoice = await Invoice.find({ isRecycled: false });
  const leave = await LeaveRequest.find();

  const totalAmount = totalInvoice.reduce(
    (total, totalAmount) => total + totalAmount.net_total,
    0,
  );
  const totalAdvance = totalInvoice.reduce(
    (total, advance) => total + advance.advance,
    0,
  );
  const totalRemaining = totalAmount - totalAdvance;

  const formattedTotalAmount = formatToBDComma(totalAmount);
  const formattedTotalAdvance = formatToBDComma(totalAdvance);
  const formattedTotalRemaining = formatToBDComma(totalRemaining);

  const statusCounts = await Quotation.aggregate([
    {
      $match: {
        status: { $in: ['running', 'completed'] },
        isRecycled: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusSummary = statusCounts.reduce((acc: any, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  const runningCount = statusSummary['running'] || 0;
  const completedCount = statusSummary['completed'] || 0;

  return {
    statusSummary: {
      running: runningCount,
      completed: completedCount,
    },
    totalCustomers: allCustomer.length,
    totalCompanies: allCompany.length,
    totalShowRooms: allShowRoom.length,
    totalJobCard: totalJobCard.length,
    totalQuotation: totalQuotation.length,
    totalInvoice: totalInvoice.length,
    totalAmount: formattedTotalAmount,
    totalAdvance: formattedTotalAdvance,
    totalRemaining: formattedTotalRemaining,
  };
};

export const metServices = {
  getAllCustomer,
  getAllMetaFromDB,
};
