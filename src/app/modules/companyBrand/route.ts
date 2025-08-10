import express from 'express';
import { auth } from '../../middlewares/auth';
import { CompanyBrandValidations } from './validation';
import { companyBrandControllers } from './controller';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  auth('admin', 'super_admin'),
  validateRequest(CompanyBrandValidations.createCompanyBrandValidation),
  companyBrandControllers.createCompanyBrand
);

router.get('/', companyBrandControllers.getAllCompanyBrands);
router.get('/:id', companyBrandControllers.getSingleCompanyBrand);

router.patch(
  '/:id',
  auth('admin', 'super_admin'),
  validateRequest(CompanyBrandValidations.updateCompanyBrandValidation),
  companyBrandControllers.updateCompanyBrand
);

router.delete('/:id', auth('admin', 'super_admin'), companyBrandControllers.deleteCompanyBrand);

export const companyBrandRoutes = router;
