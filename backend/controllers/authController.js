import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if all fields are provided
    if(!name || !email || !password) {
      // console.log(req.body)
      return res.status(400).json({
        message: 'Please provide all required fields'
      })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if(userExists) {
      return res.sendStatus(400).json({
        message: 'User already exists with this email'
      })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    })

    // Generate token
    const token = generateToken(user._id)

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch(err) {
    console.error('Register error: ', err)
    res.status(500).json({
      message: 'Server error during registration',
      error: err.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if(!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      })
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password')

    // Check if user exists and password matches
    if(user && (await user.matchPassword(password))) {
      // Generate token
      const token = generateToken(user._id)

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      })
    } else {
      res.status(400).json({
        message: 'Invalid email or password'
      })
    }
  } catch(err) {
    console.error('Login error', err)
    res.status(500).json({
      message: 'Server error during login',
      error: err.message
    })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if(user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name, 
          email: user.email,
          role: user.role,
          addresses: user.addresses,
          createdAt: user.createdAt,
        },
      })
    } else {
      res.status(404).json({
        message: 'User not found'
      })
    }
  } catch(err) {
    console.error('Get profile error: ', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if(user) {
      // Update fields if provided
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email

      // Update password if provided
      if(req.body.password) {
        user.password = req.body.password
      }

      // Update addresses if provided
      if(req.body.addresses) {
        user.addresses = req.body.addresses
      }

      const updatedUser = await user.save()

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          addresses: updatedUser.addresses,
        },
      })
    } else {
      res.status(404).json({
        message: 'User not found'
      })
    }
  } catch(err) {
    console.error('Update profile error: ', err)
    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
}