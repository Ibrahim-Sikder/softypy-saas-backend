import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/ImageUpload';
import { purchaseControllers } from './purchase.controller';
import { PurchaseValidations } from './purchase.validation';

const router = express.Router();

router.post(
  '/',
  upload,
  validateRequest(PurchaseValidations.createPurchase),
  purchaseControllers.createPurchase,
);
router.get('/', purchaseControllers.getAllPurchase);
router.get('/:id', purchaseControllers.getSinglePurchase);
router.delete('/:id', purchaseControllers.deletePurchase);
router.put(
  '/:id',
  purchaseControllers.updatePurchase,
);

export const purchaseRoutes = router;
