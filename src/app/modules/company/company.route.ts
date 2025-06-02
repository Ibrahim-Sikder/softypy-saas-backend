import express from 'express';
import { companyController } from './company.controller';

const router = express.Router();

router
  .route('/')
  .post(companyController.createCompany)
  .get(companyController.getAllCompanies);

router
  .route('/:id')
  .get(companyController.getSingleCompanyDetails)
  .put(companyController.updateCompany)
  .delete(companyController.deleteCompany);

router.route('/recycle/:id').patch(companyController.moveToRecyledbinCompany);
router
  .route('/restore/:id')
  .patch(companyController.restoreFromRecyledbinCompany);
router
  .route('/delete-permanantly/:id')
  .delete(companyController.permanantlyDeleteCompany);

router.patch(
  '/recycle-all',
  companyController.moveAllToRecycledBinMoneyReceipts,
);
router.patch(
  '/restore-all',
  companyController.restoreAllFromRecycledBinMoneyReceipts,
);

export const CompanyRoutes = router;
