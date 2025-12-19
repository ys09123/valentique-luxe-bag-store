import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart); // Get user's cart
router.post("/", addToCart); // Add item to cart
router.delete("/clear", clearCart); 
router.put("/:itemId", updateCartItem); // Update item quantity
router.delete("/:itemId", removeFromCart); // Remove item from cart

export default router;
