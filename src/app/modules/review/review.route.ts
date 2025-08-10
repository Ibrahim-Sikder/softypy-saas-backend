import express from 'express';
import { reviewController } from './review.controller';
import { reviewValidations } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  validateRequest(reviewValidations.createReviewValidationSchema),
  reviewController.createReview,
);
router.get('/', reviewController.getAllReview);
router.get('/:id', reviewController.getSingleReview);
router.delete('/:id', reviewController.deleteReview);
router.patch(
  '/:id',
  validateRequest(reviewValidations.updateReviewValidationSchema),
  reviewController.updateReview,
);

export const reviewRoutes = router;
