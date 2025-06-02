// purchaseOrder.route.ts
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PurchaseOrderValidations } from './purchaseorder.validation';
import { purchaseOrderControllers } from './purchaseorder.controller';

const router = express.Router();

router.post(
  '/',

  validateRequest(PurchaseOrderValidations.createPurchaseOrder),
  purchaseOrderControllers.createPurchaseOrder,
);

router.get('/', purchaseOrderControllers.getAllPurchaseOrders);

router.get('/:id', purchaseOrderControllers.getSinglePurchaseOrder);

router.delete('/:id', purchaseOrderControllers.deletePurchaseOrder);

router.put(
  '/:id',
  validateRequest(PurchaseOrderValidations.updatePurchaseOrder),
  purchaseOrderControllers.updatePurchaseOrder,
);

export const purchaseOrderRoutes = router;
