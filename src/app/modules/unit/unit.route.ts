import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/ImageUpload';
import { UnitValidations } from './unit.validation';
import { unitControllers } from './unit.controller';

const router = express.Router();
router.post(
  '/',
  upload,
  validateRequest(UnitValidations.createUnitValidationSchema),
  unitControllers.createUnit,
);
router.get('/', unitControllers.getAllUnit);
router.get('/:id', unitControllers.getSingleUnit);
router.delete('/:id', unitControllers.deleteUnit);
router.patch(
  '/:id',
  validateRequest(UnitValidations.updateUnitValidationSchema),
  unitControllers.updateUnit,
);

export const unitRoutes = router;
