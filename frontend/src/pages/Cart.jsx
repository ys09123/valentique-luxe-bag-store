import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartItem from '../components/cart/CartItem';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/common/Loader';

const Cart = () => {
  const { cart, loading, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    const result = await clearCart();
    if (result.success) {
      showToast('Cart cleared', 'success');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <Loader />;

  const isEmpty = !cart || cart.items.length === 0;
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 5000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-4"
          >
            Your Selection
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mb-4">
            Shopping Cart
          </h1>
          {!isEmpty && (
            <p className="text-lg text-zinc-400 font-light">
              {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-full mb-6">
              <ShoppingBag className="h-12 w-12 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-light text-white mb-4">Your cart is empty</h2>
            <p className="text-zinc-500 mb-8">
              Discover our exclusive collection of luxury bags
            </p>
            <Link to="/products">
              <Button className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-sm tracking-[0.2em] uppercase">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-white">Items in Cart</h2>
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>

              <AnimatePresence>
                {cart.items.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </AnimatePresence>

              {/* Continue Shopping Link */}
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mt-6"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-light text-white mb-6 tracking-wide">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="text-white">
                      {shipping === 0 ? (
                        <span className="text-emerald-500">FREE</span>
                      ) : (
                        `₹${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-amber-500">
                      Add ₹{(5000 - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Tax (18%)</span>
                    <span className="text-white">₹{tax.toLocaleString()}</span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex justify-between text-lg">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-white font-medium">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-medium text-sm tracking-[0.2em] uppercase rounded-xl flex items-center justify-center gap-2 hover:cursor-pointer hover:scale-105"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="shrink-0 w-1 h-1 rounded-full bg-emerald-500" />
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="shrink-0 w-1 h-1 rounded-full bg-emerald-500" />
                    Easy returns within 7 days
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="shrink-0 w-1 h-1 rounded-full bg-emerald-500" />
                    100% authentic products
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;