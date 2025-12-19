import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Middleware: Protect routes - verify JWT token

export const protect = async (req, res, next) => {
  let token;
  // Check if token exists in Authorization header
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token 
      token = req.headers.authorization.split(' ')[1]
      // Verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user token
      req.user = await User.findById(decoded.id).select('-password')

      if(!req.user) {
        return res.status(401).json({
          message: 'User not found'
        })
      }
      next()
    } catch(err) {
      console.error('Token verification error: ', err)
      return res.status(401).json({
        message: 'Not authorized, token failed'
      })
    }
  }
  if(!token) {
    return res.status(401).json({
      message: 'Not authorized, no token'
    })
  }
}

// Middleware: Check if user is admin

export const admin = (req, res, next) => {
  // Check if user exists and is admin
  if(req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({
      message: 'Not authorized as admin'
    })
  }
}