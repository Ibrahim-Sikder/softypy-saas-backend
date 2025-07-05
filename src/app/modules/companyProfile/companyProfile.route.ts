import express from 'express';
import { companyProfileController } from './companyProfile.controller';
const router = express.Router();
router.post('/create', companyProfileController.createCompanyProfile);

router.get('/', companyProfileController.getCompanyProfile);

router.put('/update/:id', companyProfileController.updateCompanyProfile);

export const CompanyProfileRoutes = router;
