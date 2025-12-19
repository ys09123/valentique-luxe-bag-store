import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from '../controllers/productController.js'
import { protect, admin } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

// Public Routes
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProductById)

// Admin Routes (Protected)
router.post(
  '/',
  protect,
  admin,
  upload.array('images', 5),
  createProduct
)

router.put(
  '/:id',
  protect,
  admin,
  upload.array('images', 5),
  updateProduct
)

router.delete('/:id', protect, admin, deleteProduct)

export default router