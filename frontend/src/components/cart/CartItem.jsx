import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const { showToast } = useToast();

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    if (newQuantity > item.product.stock) {
      showToast(`Only ${item.product.stock} items available`, 'error');
      return;
    }

    const result = await updateCartItem(item._id, newQuantity);
    if (!result.success) {
      showToast(result.message, 'error');
    }
  };

  const handleRemove = async () => {
    const result = await removeFromCart(item._id);
    if (result.success) {
      showToast('Item removed from cart', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
    >
      {/* Product Image */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-900">
        <img
          src={`${API_URL}${item.product.images[0]}`}
          alt={item.product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-amber-500/80 uppercase mb-1">
            {item.product.brand}
          </p>
          <h3 className="text-lg font-light text-white mb-2 tracking-wide">
            {item.product.name}
          </h3>
          <p className="text-sm text-zinc-500">
            {item.product.material} • {item.product.color}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-all disabled:opacity-50"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-white font-medium min-w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-all disabled:opacity-50"
              disabled={item.quantity >= item.product.stock}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xl font-light text-white">
              ₹{(item.price * item.quantity).toLocaleString()}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-zinc-500">
                ₹{item.price.toLocaleString()} each
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="shrink-0 p-2 h-fit text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

export default CartItem;