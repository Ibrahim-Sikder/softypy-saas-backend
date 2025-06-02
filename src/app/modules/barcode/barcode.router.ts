import { Router } from 'express';
import { barcodeController } from './barcode.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createBarcodeSchema } from './barcode.validation';

const router = Router();

router.get('/', barcodeController.getAllBarcode);
router.post(
  '/',
  validateRequest(createBarcodeSchema),
  barcodeController.createBarcode,
);
router.delete('/:id', barcodeController.deleteBarcode);

export const barcodeRoutes = router;
