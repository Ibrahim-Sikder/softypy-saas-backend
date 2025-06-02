import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/ImageUpload';
import { AdjustmentValidations } from './adjustment.validation';
import { adjustmentControllers } from './adjustment.controller';

const router = express.Router();
router.post(
  '/',
  upload,
  validateRequest(AdjustmentValidations.createAdjustmentSchema),
  adjustmentControllers.createAdjustment,
);
router.get('/', adjustmentControllers.getAllAdjustment);
router.get('/:id', adjustmentControllers.getSingleAdjustment);
router.delete('/:id', adjustmentControllers.deleteAdjustment);
router.patch(
  '/:id',
  validateRequest(AdjustmentValidations.updateAdjustmentSchema),
  adjustmentControllers.updateAdjustment,
);

export const adjustmentRoutes = router;
