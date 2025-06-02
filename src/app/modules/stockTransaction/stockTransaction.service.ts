// src/modules/stockTransaction/stockTransaction.services.ts

import { StockTransaction } from './stockTransaction.model';
import { IStockTransaction } from './stockTransaction.interface';

const createStockTransaction = async (
  payload: IStockTransaction
): Promise<IStockTransaction> => {
  const stockTransaction = await StockTransaction.create(payload);
  return stockTransaction;
};

const getAllStockTransactions = async (): Promise<IStockTransaction[]> => {
  const transactions = await StockTransaction.find()
    .populate(['product', 'warehouse'])
    .sort({ date: -1 });
  return transactions;
};

const getSingleStockTransaction = async (
  id: string
): Promise<IStockTransaction | null> => {
  const transaction = await StockTransaction.findById(id).populate([
    'product',
    'warehouse',
  ]);
  return transaction;
};

export const stockTransactionServices = {
  createStockTransaction,
  getAllStockTransactions,
  getSingleStockTransaction,
};
