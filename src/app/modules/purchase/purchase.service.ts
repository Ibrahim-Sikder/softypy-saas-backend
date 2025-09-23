/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { purchaseSearch } from './purchase.const';
import { TPurchase } from './purchase.interface';
import { getTenantModel } from '../../utils/getTenantModels';


// const createPurchase = async (tenantDomain: string, payload: any) => {
//   const { Model: Purchase, connection: tenantConnection } =
//     await getTenantModel(tenantDomain, 'Purchase');

//   const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');
//   const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

//   const session = await tenantConnection.startSession();
//   session.startTransaction();

//   try {
//     // Create purchase
//     const newPurchase = await Purchase.create([payload], { session });

//     const warehouseId = Array.isArray(payload.warehouse)
//       ? payload.warehouse[0]
//       : payload.warehouse;

//     // Insert stock entries
//     for (const item of payload.products) {
//       await Stocks.create(
//         [
//           {
//             product: item.productId,
//             warehouse: warehouseId,
//             quantity: item.quantity,
//             type: 'in',
//             referenceType: 'purchase',
//             purchasePrice: item.productPrice,
//             batchNumber: item.batchNumber || undefined,
//             expiryDate: item.expiryDate || undefined,
//             note: payload.note || '',
//           },
//         ],
//         { session },
//       );
//     }

//     // ✅ Update supplier to link this purchase
//     if (payload.suppliers) {
//       await Supplier.updateOne(
//         { _id: payload.suppliers },
//         { $push: { purchases: newPurchase[0]._id } },
//         { session },
//       );
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return newPurchase[0];
//   } catch (error: any) {
//     await session.abortTransaction();
//     session.endSession();

//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'Failed to create purchase and stocks',
//     );
//   }
// };



// export const updatePurchase = async (
//   tenantDomain: string,
//   id: string,
//   payload: Partial<TPurchase>,
// ) => {
//   const { Model: Purchase, connection: tenantConnection } =
//     await getTenantModel(tenantDomain, 'Purchase');
//   const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

//   const session = await tenantConnection.startSession();
//   session.startTransaction();

//   try {
//     //  Update purchase
//     const updatedPurchase = await Purchase.findByIdAndUpdate(id, payload, {
//       new: true,
//       runValidators: true,
//       session,
//     });

//     if (!updatedPurchase) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Purchase not found');
//     }

//     //  Update supplier relationship
//     if (payload.suppliers) {
//       // Remove this purchase ID from all suppliers first (in case supplier changed)
//       await Supplier.updateMany(
//         { purchases: updatedPurchase._id },
//         { $pull: { purchases: updatedPurchase._id } },
//         { session },
//       );

//       // Add to the new supplier
//       await Supplier.updateOne(
//         { _id: payload.suppliers },
//         { $addToSet: { purchases: updatedPurchase._id } }, 
//         { session },
//       );
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return updatedPurchase;
//   } catch (error: any) {
//     await session.abortTransaction();
//     session.endSession();

//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to update purchase',
//     );
//   }
// };




export const createPurchase = async (tenantDomain: string, payload: any) => {
  const { Model: Purchase, connection } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    const newPurchase = await Purchase.create([payload], { session });

    if (payload.suppliers && payload.suppliers.length) {
      for (const supplierId of payload.suppliers) {
        const supplier = await Supplier.findById(supplierId).session(session);
        if (!supplier) continue;

        const due = (payload.grandTotal || 0) - (payload.paidAmount || 0);
        supplier.totalDue += due;
        supplier.balance = supplier.totalDue - supplier.totalPaid;

        if (!supplier.purchases.includes(newPurchase[0]._id)) {
          supplier.purchases.push(newPurchase[0]._id);
        }

        await supplier.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return newPurchase[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


const updatePurchase = async (tenantDomain: string, id: string, payload: Partial<TPurchase>) => {
  const { Model: Purchase, connection } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) throw new Error('Purchase not found');

    const oldPaid = purchase.paidAmount || 0;
    const oldGrandTotal = purchase.grandTotal || 0;

    const updated = await Purchase.findByIdAndUpdate(id, payload, { new: true, session });

    // Update supplier due/balance
    if (updated.suppliers && updated.suppliers.length) {
      for (const supplierId of updated.suppliers) {
        const supplier = await Supplier.findById(supplierId).session(session);
        if (!supplier) continue;

        // Remove old due, add new
        supplier.totalDue -= (oldGrandTotal - oldPaid);
        const newDue = (updated.grandTotal || 0) - (updated.paidAmount || 0);
        supplier.totalDue += newDue;

        supplier.balance = supplier.totalDue - supplier.totalPaid;

        if (!supplier.purchases.includes(updated._id)) {
          supplier.purchases.push(updated._id);
        }

        await supplier.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    return updated;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


export const deletePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const result = await Purchase.deleteOne({ _id: id });
  return result;
};
export const getAllPurchase = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const purchaseQuery = new QueryBuilder(Purchase.find(), query)
    .search(purchaseSearch)
    // .filter()
    // .sort()
    .paginate()
    .fields();

  const meta = await purchaseQuery.countTotal();

  const purchases = await purchaseQuery.modelQuery.populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
    {
      path: 'products.productId',
      model: Product,
    },
  ]);

  return {
    meta,
    purchases,
  };
};

export const getSinglePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const result = await Purchase.findById(id).populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
  ]);
  return result;
};




export const purchaseServices = {
  createPurchase,
  getAllPurchase,
   getSinglePurchase,
  updatePurchase,
  deletePurchase,
};
