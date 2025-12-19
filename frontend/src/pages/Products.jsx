import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from './ProductCard';
import Loader from '../components/common/Loader';
import { productsAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    material: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const params = {
        ...cleanFilters,
        search: searchQuery,
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      material: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
    setSearchQuery('');
  };

  const categories = ['Handbag', 'Shoulder Bag', 'Crossbody', 'Tote', 'Clutch'];
  const materials = ['Leather', 'Vegan Leather', 'Canvas', 'Suede', 'Nylon', 'Exotic Leather'];

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
            Exclusive Collection
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mb-6">
            Our Products
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-light">
            Discover our curated selection of luxury bags
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:border-amber-500/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-sm tracking-wide">Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm tracking-[0.2em] text-amber-500/80 uppercase font-medium">
                      Filter Options
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Material */}
                    <div>
                      <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                        Material
                      </label>
                      <select
                        value={filters.material}
                        onChange={(e) => handleFilterChange('material', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                      >
                        <option value="">All Materials</option>
                        {materials.map((mat) => (
                          <option key={mat} value={mat}>{mat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                        Min Price
                      </label>
                      <input
                        type="number"
                        placeholder="₹0"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                        Max Price
                      </label>
                      <input
                        type="number"
                        placeholder="₹10000"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                      Sort By
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: 'newest', label: 'Newest' },
                        { value: 'price-asc', label: 'Price: Low to High' },
                        { value: 'price-desc', label: 'Price: High to Low' },
                        { value: 'name', label: 'Name' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterChange('sort', option.value)}
                          className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                            filters.sort === option.value
                              ? 'bg-amber-500 text-black'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-sm text-zinc-500">
            Showing <span className="text-white font-medium">{products.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No products found</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-amber-500 hover:text-amber-400 text-sm underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;