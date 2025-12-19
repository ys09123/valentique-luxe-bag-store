import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/toastContext';
import { API_URL } from '../config';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      showToast('Added to cart successfully', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 transition-all duration-500">
          
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-zinc-900">
            <img
              src={`${API_URL}${product.images[0]}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Stock Badge */}
            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-black text-[10px] font-medium tracking-wider uppercase rounded-full">
                Only {product.stock} Left
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-medium tracking-wider uppercase rounded-full">
                Out of Stock
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-4 py-3 bg-white text-black text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:cursor-pointer hover:font-bold hover:scale-105"
              >
                <ShoppingCart className="h-4 w-4 hover:font-bold" />
                Add to Cart
              </button>
              <button className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/80 transition-all hover:cursor-pointer hover:scale-110">
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <p className="text-[10px] tracking-[0.3em] text-amber-500/80 uppercase mb-2 font-medium">
              {product.brand}
            </p>
            <h3 className="text-lg font-light text-white mb-2 tracking-wide group-hover:text-amber-500 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-zinc-500 mb-3 line-clamp-2 font-light">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-2xl font-light text-white">
                ₹{product.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                  {product.material}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;