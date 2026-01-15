import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Upload, Search, Package } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { productsAPI } from "../../services/api";
import { useToast } from "../../context/toastContext";
import Loader from "../../components/common/Loader";
import { API_URL } from "../../config";

const ProductManagement = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "Handbag",
    material: "Leather",
    color: "",
    stock: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        brand: product.brand,
        category: product.category,
        material: product.material,
        color: product.color,
        stock: product.stock,
      });

      // 👇 2. FIX: Hybrid Image Preview (Handles Objects & Strings)
      setImagePreviews(
        product.images.map((img) => 
          img?.url ? img.url : `${API_URL}${img}`
        )
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        brand: "",
        category: "Handbag",
        material: "Leather",
        color: "",
        stock: "",
      });
      setImageFiles([]);
      setImagePreviews([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Append images
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      if (editingProduct) {
        // Update product
        await productsAPI.update(editingProduct._id, formDataToSend);
        showToast("Product updated successfully", "success");
      } else {
        // Create product
        await productsAPI.create(formDataToSend);
        showToast("Product created successfully", "success");
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast(
        error.response?.data?.message || "Failed to save product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productsAPI.delete(id);
      showToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product", "error");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 border: amber-500/50 shadow:amber glow">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-2">
              Admin Panel
            </p>
            <h1 className="text-4xl font-light text-white tracking-tight">
              Product Management
            </h1>
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-white text-black hover:bg-zinc-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/60 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Brand
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Stock
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Category
                  </th>
                  <th className="text-right px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images[0]?.url 
                              ? product.images[0].url 
                              : `${API_URL}${product.images[0]}`
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />

                        <div>
                          <p className="text-sm text-white font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {product.material}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          product.stock > 10
                            ? "bg-emerald-500/20 text-emerald-400"
                            : product.stock > 0
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No products found</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light text-white">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <Label
                    htmlFor="name"
                    className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                  >
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="Luxury Leather Handbag"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label
                    htmlFor="description"
                    className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                    placeholder="Keep it under 200 characters. Focus on material & craftsmanship."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <Label
                      htmlFor="price"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Price
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="₹"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <Label
                      htmlFor="brand"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="Gucci"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Category
                    </Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Handbag">Handbag</option>
                      <option value="Shoulder Bag">Shoulder Bag</option>
                      <option value="Crossbody">Crossbody</option>
                      <option value="Tote">Tote</option>
                      <option value="Clutch">Clutch</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Material */}
                  <div>
                    <Label
                      htmlFor="material"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Material
                    </Label>
                    <select
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Leather">Leather</option>
                      <option value="Vegan Leather">Vegan Leather</option>
                      <option value="Canvas">Canvas</option>
                      <option value="Suede">Suede</option>
                      <option value="Nylon">Nylon</option>
                      <option value="Exotic Leather">Exotic Leather</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Color */}
                  <div>
                    <Label
                      htmlFor="color"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Color
                    </Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="Black"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <Label
                      htmlFor="stock"
                      className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                    >
                      Stock
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="10"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <Label
                    htmlFor="images"
                    className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                  >
                    Product Images
                  </Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all">
                      <Upload className="h-8 w-8 text-zinc-500 mb-2" />
                      <span className="text-sm text-zinc-500">
                        Click to upload images
                      </span>
                      <span className="text-xs text-zinc-600 mt-1">
                        PNG, JPG up to 5MB (Max 5 images)
                      </span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 cursor-pointer bg-transparent border border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 cursor-pointer bg-white text-black hover:bg-zinc-200"
                  >
                    {submitting
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ProductManagement;