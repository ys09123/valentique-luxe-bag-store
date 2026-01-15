import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'Cash on Delivery',
    } = req.body

    // Validate shipping address
    if(!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({
        message: 'Please provide complete shipping address',
      })
    }

    // Get user's cart
    const cart = await Cart.findOne({
      user: req.user._id
    }).populate('items.product')

    if(!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Your cart is empty.',
      })
    }

    // Check stock availability
    for(const item of cart.items) {
      const product = await Product.findById(item.product._id)
      if(!product) {
        return res.status(404).json({
          message: `Product ${item.product.name} not found`
        })
      }
      if(product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available`,
        })
      }
    }

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images?.[0]?.url || '',
    }))

    // Calculate prices
    const itemsPrice = cart.totalPrice
    const shippingPrice = itemsPrice > 5000 ? 0 : 100
    const taxPrice = Math.round(itemsPrice * 0.18)
    const totalPrice = itemsPrice + shippingPrice + taxPrice
    
    // Create Order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    })

    // Update product stock
    for(const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      })
    }

    // Clear cart
    cart.items = []
    cart.totalPrice = 0
    cart.totalItems = 0
    await cart.save()

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    })
  } catch(err) {
    console.error('Create order error: ', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name brand')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (err) {
    console.error('Get my orders error:', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message,
    })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name brand');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Check if order belongs to user (or user is admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name brand')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: 'Invalid order status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    order.orderStatus = orderStatus;

    // If delivered, set deliveredAt date
    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'Paid';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};