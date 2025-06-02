import express from 'express';
import { stockTransferControllers } from './stockTransfer.controller';

const router = express.Router();


router.get('/', stockTransferControllers.getAllStockTransfers);

router.delete('/:id', stockTransferControllers.deleteStockTransfer);

export const stockTransferRoutes = router;
