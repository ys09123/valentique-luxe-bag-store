import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { API_URL } from "../../config";

const ProductRecommendationCard = ({ product, onAddToCart }) => {
  const imageUrl = product.images?.[0]?.url
    ? product.images[0].url
    : product.images?.[0]
      ? `${API_URL}${product.images[0]}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group flex gap-3 p-2.5 rounded-xl bg-zinc-800/60 border border-white/5 hover:border-amber-500/20 transition-all duration-300"
    >
      {/* Product Image */}
      {imageUrl && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-amber-500/70 font-medium">
          {product.brand}
        </p>
        <h4 className="text-xs font-medium text-white truncate mt-0.5">
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-white">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-700/80 text-zinc-400 rounded">
            {product.material}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product._id);
            }}
            disabled={product.stock === 0}
            className="flex items-center gap-1 px-2.5 py-1 bg-white text-black text-[10px] font-medium uppercase tracking-wider rounded-md hover:bg-zinc-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            <ShoppingCart className="h-3 w-3" />
            {product.stock === 0 ? "Sold Out" : "Add"}
          </button>
          <Link
            to={`/products/${product._id}`}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 text-zinc-400 text-[10px] font-medium uppercase tracking-wider rounded-md border border-white/10 hover:border-amber-500/30 hover:text-white transition-all"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductRecommendationCard;
