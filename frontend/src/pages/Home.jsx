import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { API_URL } from '../config';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productsAPI.getFeatured();
        setFeaturedProducts(response.data.products.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-60"
            >
              <source 
                src="/videos/hero2.mp4" 
                type="video/mp4" 
              />
            </video>
          
            <div className="absolute inset-0 bg-linear-to-b from-zinc-950/30 via-zinc-950/60 to-zinc-950" />
          </div>

          {/* --- CONTENT LAYER --- */}
          <div className="container mx-auto px-4 text-center relative z-10 mt-20"> 
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] tracking-[0.4em] text-[#F4C430]/90 uppercase font-medium mb-6"
              >
                Curated Luxury Collection
              </motion.p>

              <h1 className="text-6xl md:text-8xl font-light text-white tracking-tight mb-6">
                Redefine
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-100 via-[#F4C430] to-amber-200">
                  Elegance
                </span>
              </h1>

              <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-12 font-light tracking-wide text-shadow-sm">
                Experience the pinnacle of luxury with our handpicked collection of designer bags. 
                Each piece tells a story of craftsmanship and timeless sophistication.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/products"
                  className="group px-8 py-4 bg-white text-black rounded-xl text-sm font-medium tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all flex items-center gap-2"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/products"
                  className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl text-sm font-medium tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                >
                  View Catalog
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-px h-12 bg-linear-to-b from-transparent via-zinc-400 to-transparent"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: 'Authentic Luxury',
                  description: '100% genuine designer pieces'
                },
                {
                  icon: Shield,
                  title: 'Secure Shopping',
                  description: 'Protected transactions and encrypted payment processing'
                },
                {
                  icon: Truck,
                  title: 'Express Delivery',
                  description: 'Complimentary shipping on orders above ₹4,999'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group p-8 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 transition-all"
                >
                  <feature.icon className="h-8 w-8 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-light text-white mb-3 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-4">
                Signature Pieces
              </p>
              <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
                Featured Collection
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="group block"
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-amber-500/20 transition-all">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={`${API_URL}${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6">
                          <p className="text-[10px] tracking-[0.3em] text-amber-500/80 uppercase mb-2">
                            {product.brand}
                          </p>
                          <h3 className="text-lg font-light text-white mb-3 tracking-wide group-hover:text-amber-500 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-light text-white">
                            ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-16">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-white/10 text-white rounded-xl text-sm font-medium tracking-[0.2em] uppercase hover:bg-white/5 transition-all group"
              >
                View All Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;