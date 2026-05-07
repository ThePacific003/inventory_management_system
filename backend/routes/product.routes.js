import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// all routes require login
router.get('/',               protect,             getAllProducts);
router.get('/low-stock',      protect,             getLowStockProducts);
router.get('/:id',            protect,             getProductById);
router.post('/',              protect,             createProduct);
router.put('/:id',            protect,             updateProduct);
router.delete('/:id',         protect, adminOnly,  deleteProduct);

export default router;