import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/ImageUpload';
import { ProductValidations } from './product.validation';
import { productControllers } from './product.controller';

const router = express.Router();
router.post(
  '/',
  upload,
  validateRequest(ProductValidations.createProduct),
  productControllers.createProduct,
);
router.get('/', productControllers.getAllProduct);
router.get('/:id', productControllers.getSingleProduct);
router.delete('/:id', productControllers.deleteProduct);
router.patch(
  '/:id',
  validateRequest(ProductValidations.updateProduct),
  productControllers.updateProduct,
);

export const productRoutes = router;
