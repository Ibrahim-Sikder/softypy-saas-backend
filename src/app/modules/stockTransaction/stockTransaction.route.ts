// src/modules/stockTransaction/stockTransaction.route.ts
import express from 'express';
import { stockTransactionControllers } from './stockTransaction.controller';

const router = express.Router();

router.post('/', stockTransactionControllers.createStockTransaction);
router.get('/', stockTransactionControllers.getAllStockTransactions);
router.get('/:id', stockTransactionControllers.getSingleStockTransaction);

export const stockTransactionRoutes = router;
