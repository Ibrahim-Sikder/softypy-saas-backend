import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { DonationValidations } from './donation.validation';
import { DonationController } from './donation.controller';

const router = express.Router();

router.post(
  '/',
  validateRequest(DonationValidations.createDonationValidationSchema),
  DonationController.createDonation,
);
router.get('/', DonationController.getAllDonation);
router.get('/:id', DonationController.getSingleDonation);
router.delete('/:id', DonationController.deleteDonation);
router.patch('/:id', DonationController.updateDonation);

export const donationRoutes = router;
