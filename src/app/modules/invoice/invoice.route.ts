import express from 'express';
import { invoiceController } from './invoice.controller';

const router = express.Router();

router
  .route('/')
  .post(invoiceController.createInvoice)
  .get(invoiceController.getAllInvoices);
router.get('/invoice/:invoiceId', invoiceController.generateQuotationPdf);

router
  .route('/:id')
  .get(invoiceController.getSingleInvoice)
  .put(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

router
  .route('/remove-invoice')
  .patch(invoiceController.removeInvoiceFromUpdate);

router.route('/recycle/:id').patch(invoiceController.moveToRecylebinInvoice);
router
  .route('/restore/:id')
  .patch(invoiceController.restoreFromRecylebinInvoice);
router
  .route('/delete-permanantly/:id')
  .delete(invoiceController.permanantlyDeleteInvoice);
  router.patch('/recycle-all', invoiceController.moveAllToRecycledBinMoneyReceipts);
  router.patch('/restore-all', invoiceController.restoreAllFromRecycledBinMoneyReceipts);


export const InvoiceRoutes = router;
