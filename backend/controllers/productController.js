import Product from '../models/Product.js'

export const getProducts = async (req, res) => {
  try {
    // Query parameters for filtering
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      color,
      material,
      sort,
      page = 1,
      limit = 12,
    } = req.query

    // Build query object
    const query = {}

    // Search by name, description, or brand
    if (search) {
      query.$text = { $search: search }
    }

    // Filter by category
    if (category) {
      query.category = category
    }

    // Filter by brand
    if (brand) {
      query.brand = brand
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Filter by color
    if (color) {
      query.color = { $regex: color, $options: 'i' } // Case insensitive
    }

    // Filter by material
    if (material) {
      query.material = material
    }

    // Sorting options
    let sortOption = {}
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 }
        break
      case 'price-desc':
        sortOption = { price: -1 }
        break
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'name':
        sortOption = { name: 1 }
        break
      default:
        sortOption = { createdAt: -1 } // Default: newest first
    }

    // Pagination
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // Execute query
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip)

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (product) {
      res.json({
        success: true,
        product,
      })
    } else {
      res.status(404).json({
        message: 'Product not found',
      })
    }
  } catch (error) {
    console.error('Get product by ID error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const createProduct = async (req, res) => {
  try {
    // console.log('📁 Uploaded files:', req.files);
    // console.log('📝 Request body:', req.body); 
    const {
      name,
      description,
      price,
      brand,
      category,
      material,
      color,
      stock,
      dimensions,
    } = req.body

    // Handle uploaded images
    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
      console.log('✅ Images processed:', images);
    } else {
      console.log('❌ No files uploaded');
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      brand,
      category,
      material,
      color,
      stock,
      images,
      dimensions,
    })

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    // Update fields
    const {
      name,
      description,
      price,
      brand,
      category,
      material,
      color,
      stock,
      isFeatured,
      dimensions,
    } = req.body

    if (name) product.name = name
    if (description) product.description = description
    if (price !== undefined) product.price = price
    if (brand) product.brand = brand
    if (category) product.category = category
    if (material) product.material = material
    if (color) product.color = color
    if (stock !== undefined) product.stock = stock
    if (isFeatured !== undefined) product.isFeatured = isFeatured
    if (dimensions) product.dimensions = dimensions

    // Handle uploaded images
    if (req.files && req.files.length > 0) { 
      const newImages = req.files.map((file) => `/uploads/${file.filename}`)
      product.images = [...product.images, ...newImages] 
    }

    const updatedProduct = await product.save()

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      })
    }

    await product.deleteOne()

    res.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)

    res.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('Get featured products error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}