import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/ImageUpload';
import { BrandValidations } from './brand.validation';
import { brandControllers } from './brand.controller';

const router = express.Router();

router.post(
  '/',
  upload,
  validateRequest(BrandValidations.createbrandValidationSchema),
  brandControllers.createBrand,
);
router.get('/', brandControllers.getAllBrand);
router.get('/:id', brandControllers.getSingleBrand);
router.delete('/:id', brandControllers.deleteBrand);
router.patch(
  '/:id',
  validateRequest(BrandValidations.updatebrandValidationSchema),
  brandControllers.updateBrand,
);

export const brandRoutes = router;
