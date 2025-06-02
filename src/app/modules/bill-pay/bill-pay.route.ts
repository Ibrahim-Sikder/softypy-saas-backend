import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { billPayValidation } from './bill-pay.validation';
import { billPayController } from './bill-pay.controller';

const router = express.Router();

router
  .route('/')
  .post(
    // validateRequest(billPayValidation.billPayValidationSchema),
    billPayController.createBillPay,
  )
  .get(billPayController.getAllBillPays);

router
  .route('/:id')
  .get(billPayController.getSingleBillPay)
  .patch(billPayController.updateBillPay)
  .delete(billPayController.deleteBillPay);

export const BillPayRoutes = router;
