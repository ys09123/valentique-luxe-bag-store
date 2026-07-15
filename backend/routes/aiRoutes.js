import express from 'express'
import { chat, clearChat } from '../controllers/aiController.js'

const router = express.Router()

// Public Routes
router.post('/chat', chat)
router.delete('/chat/:conversationId', clearChat)

export default router
