import express from 'express'
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(admin)

// Admin Dashboard and stats
router.get('/stats', getDashboardStats)

// User management
router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/role', updateUserRole)

export default router