import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2, CheckCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/toastContext";
import { ordersAPI } from "../services/api";
import { API_URL } from "../config";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.totalPrice;
  const shipping = subtotal > 5000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const finalizeOrder = async () => {
    setOrderPlaced(true);
    showToast("Order placed successfully!", "success");
    await clearCart();
    setTimeout(() => {
      navigate("/profile");
    }, 3000);
    setLoading(false);
  };

  const handleRazorpayPayment = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      showToast("Razorpay SDK failed to load. Are you online?", "error");
      setLoading(false);
      return;
    }

    try {
      const result = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const data = await result.json();

      if (!data.id) {
        showToast("Server error. Could not initiate payment.", "error");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Valentique Luxe",
        description: "Payment for Luxury Bag",
        order_id: data.id,

        handler: async function (response) {
          try {
            await ordersAPI.create({
              shippingAddress,
              paymentMethod: "Prepaid (Razorpay)",
              paymentInfo: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              items: cart.items,
              totalPrice: total,
            });

            await fetch(`${API_URL}/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            finalizeOrder();
          } catch (err) {
            console.error(err);
            showToast("Payment successful but order creation failed.", "error");
            setLoading(false);
          }
        },
        prefill: {
          name: "Valentique Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F59E0B",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            showToast("Payment cancelled", "info");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      showToast("Something went wrong with payment.", "error");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => { 
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "Cash on Delivery") {
        await ordersAPI.create({
          shippingAddress,
          paymentMethod,
          items: cart.items,
          totalPrice: total,
        });
        finalizeOrder();
      } else {
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showToast(
        error.response?.data?.message || "Failed to place order",
        "error"
      );
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-light text-white mb-4">Order Placed!</h1>
          <p className="text-zinc-400 mb-8">
            Thank you for your purchase. Redirecting to your orders...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm tracking-wide">Back to Cart</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-4"
          >
            Final Step
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight">
            Checkout
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                <h2 className="text-xl font-light text-white mb-6 tracking-wide">
                  Shipping Address
                </h2>

                <div className="space-y-5">
                  <div>
                    <Label
                      htmlFor="street"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Street Address
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      required
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="state"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="zipCode"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        Zip Code
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="400001"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="country"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
                <h2 className="text-xl font-light text-white mb-6 tracking-wide">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {[
                    { value: "Cash on Delivery", icon: "💵" },
                    { value: "Prepaid using Razorpay", icon: "📱" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:cursor-pointer ${
                        paymentMethod === method.value
                          ? "border-amber-500 bg-amber-500/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-white font-light">
                        {method.value}
                      </span>
                      {paymentMethod === method.value && (
                        <CheckCircle className="h-5 w-5 text-amber-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-light text-white mb-6 tracking-wide">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={`${API_URL.replace("/api", "")}${
                          item.product.images[0].startsWith("/") ? "" : "/"
                        }${item.product.images[0]}`}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white font-light line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-white">
                      ₹{subtotal.toLocaleString()}
                    </span>
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

                {/* Place Order Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-medium text-sm tracking-[0.2em] uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      {paymentMethod === "Cash on Delivery"
                        ? "Place COD Order"
                        : "Pay Now"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-zinc-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
