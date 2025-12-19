import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Package, 
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Loader from '../components/common/Loader';
import { Button } from '../components/ui/button';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/toastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Product not found', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    
    if (result.success) {
      showToast(`Added ${quantity} item(s) to cart`, 'success');
    } else {
      showToast(result.message, 'error');
    }
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (isAuthenticated) {
      navigate('/cart');
    }
  };

  if (loading) return <Loader />;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-150 h-150 bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm tracking-wide">Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5"
            >
              <img
                src={`${API_URL.replace('/api', '')}${product.images[selectedImage]}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((selectedImage - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((selectedImage + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-amber-500'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={`${API_URL.replace('/api', '')}${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-2">
                {product.brand}
              </p>
              <h1 className="text-4xl font-light text-white tracking-tight mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-light text-white mb-2">
                ₹{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div>
              {product.stock > 0 ? (
                <p className="text-sm text-emerald-500 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {product.stock < 5 ? `Only ${product.stock} left in stock` : 'In Stock'}
                </p>
              ) : (
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Out of Stock
                </p>
              )}
            </div>

            {/* Description */}
            <div className="py-6 border-t border-b border-white/10">
              <p className="text-zinc-400 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wide uppercase">Category</p>
                  <p className="text-sm text-white">{product.category}</p>
                </div>
                <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wide uppercase">Material</p>
                  <p className="text-sm text-white">{product.material}</p>
                </div>
                <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wide uppercase">Color</p>
                  <p className="text-sm text-white">{product.color}</p>
                </div>
                <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1 tracking-wide uppercase">Stock</p>
                  <p className="text-sm text-white">{product.stock} units</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-white hover:bg-white/5 transition-all"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-3 text-white hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0 || addingToCart}
                className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-medium text-sm tracking-[0.2em] uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {addingToCart ? 'Adding...' : 'Buy Now'}
              </Button>
              
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full h-14 bg-transparent border border-white/10 text-white hover:bg-white/5 font-medium text-sm tracking-[0.2em] uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="pt-6 space-y-4">
              {[
                { icon: Shield, text: 'Authenticity Guaranteed' },
                { icon: Truck, text: 'Free Shipping on orders above ₹5,000' },
                { icon: Package, text: 'Easy Returns within 7 days' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-zinc-400">
                  <feature.icon className="h-4 w-4 text-amber-500" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;