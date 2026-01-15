import mongoose from "mongoose";

// Product Schema

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add product name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add product description"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add product price"],
      min: [0, "Price cannot be negative"],
    },
    brand: {
      type: String,
      required: [true, "Please add brand name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add category"],
      enum: ["Handbag", "Shoulder Bag", "Crossbody", "Tote", "Clutch", "Other"],
    },
    material: {
      type: String,
      required: [true, "Please add material"],
      enum: [
        "Leather",
        "Vegan Leather",
        "Canvas",
        "Suede",
        "Nylon",
        "Exotic Leather",
        "Other",
      ],
    },
    color: {
      type: String,
      required: [true, "Please add color"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Please add stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization

productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
