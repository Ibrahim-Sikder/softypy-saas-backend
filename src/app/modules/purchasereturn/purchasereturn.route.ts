import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { purchaseReturnControllers } from './purchasereturn.controller';
import { PurchaseReturnValidations } from './purchasereturn.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(PurchaseReturnValidations.createPurchaseReturn),
  purchaseReturnControllers.createPurchaseReturn
);

router.get('/', purchaseReturnControllers.getAllPurchaseReturns);

router.get('/:id', purchaseReturnControllers.getSinglePurchaseReturn);

router.delete('/:id', purchaseReturnControllers.deletePurchaseReturn);

router.put(
  '/:id',
  validateRequest(PurchaseReturnValidations.updatePurchaseReturn),
  purchaseReturnControllers.updatePurchaseReturn
);

export const purchaseReturnRoutes = router;
