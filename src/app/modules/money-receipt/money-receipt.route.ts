import express from 'express';
import { moneyReceiptController } from './money-receipt.controller';
import validateRequest from '../../middlewares/validateRequest';
import { moneyReceiptValidation } from './money-receipt.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(moneyReceiptValidation.moneyReceiptValidationSchema),
    moneyReceiptController.createMoneyReceipt,
  )
  .get(moneyReceiptController.getAllMoneyReceipts)

  router.get('/duemoney-receipts', moneyReceiptController.getDueAllMoneyReceipts);
router
  .route('/:id')
  .get(moneyReceiptController.getSingleMoneyReceipt)
  .put(moneyReceiptController.updateMoneyReceipt)
  .delete(moneyReceiptController.deleteMoneyReceipt);
router.get('/money/:moneyReceiptId', moneyReceiptController.generateMoneyPdf);

router
  .route('/recycle/:id')
  .patch(moneyReceiptController.movetoRecyledbinMoneyReceipt);
router
  .route('/restore/:id')
  .patch(moneyReceiptController.restoreFromRecyledbinMoneyReceipt);
router
  .route('/delete-permanantly/:id')
  .delete(moneyReceiptController.permanantlyDeleteMoneyReceipt);
  router.patch('/recycle-all', moneyReceiptController.moveAllToRecycledBinMoneyReceipts);
  router.patch('/restore-all', moneyReceiptController.restoreAllFromRecycledBinMoneyReceipts);

export const MoneyReceiptRoutes = router;
