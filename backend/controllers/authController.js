import crypto from "crypto";
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import {
  createAndStoreOTP,
  verifyOTP,
  isOnCooldown,
  getCooldownTTL,
  normalizeIdentifier,
} from '../services/otpService.js'
import { sendOtpEmail } from '../services/emailService.js'

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

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

// OTP Authentication
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if(!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      })
    }

    const normalizedEmail = normalizeIdentifier(email);

    console.log('[OTP] Step 1: Checking cooldown for', normalizedEmail);
    const onCooldown = await isOnCooldown(normalizedEmail);
    console.log('[OTP] Step 1: Redis OK, onCooldown =', onCooldown);

    if(onCooldown) {
      const ttl = await getCooldownTTL(normalizedEmail);
      return res.status(429).json({
        message: 'Please wait before requesting another OTP.',
        retryAfter: ttl > 0 ? ttl : undefined,
      });
    }

    console.log('[OTP] Step 2: Creating and storing OTP...');
    const otp = await createAndStoreOTP(normalizedEmail);
    console.log('[OTP] Step 2: OTP stored in Redis OK');

    console.log('[OTP] Step 3: Sending email...');
    const emailResult = await sendOtpEmail(normalizedEmail, otp);
    console.log('[OTP] Step 3: Email result =', JSON.stringify(emailResult));

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch(err) {
    console.error('[OTP] FAILED:', err.message);
    console.error('[OTP] Stack:', err.stack);
    res.status(503).json({
      message: 'Unable to send OTP right now. Please try again shortly.'
    });
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if(!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    if(!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({
        message: 'OTP must be a 6-digit code'
      });
    }

    const normalizedEmail = normalizeIdentifier(email);

    const result = await verifyOTP(normalizedEmail, otp.trim());

    if(!result.success) {
      if(result.reason === 'EXPIRED') {
        return res.status(400).json({
          message: 'OTP expired or not found. Please request a new one.'
        });
      }
      if(result.reason === 'MAX_ATTEMPTS') {
        return res.status(429).json({
          message: 'Too many incorrect attempts. Please request a new OTP.'
        });
      }
      // reason === INVALID
      return res.status(400).json({
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP verified — reuse the existing User model + generateToken util, exactly like register/login do, instead of a second auth strategy.

    let user = await User.findOne({ email: normalizedEmail });

    if(!user) {
      // First-time OTP login provisions an account. The password field is required by the existing schema but is never used for OTP-based accounts — it's a random value, hashed by the model's existing pre('save') hook, purely to satisfy the schema
      user = await User.create({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: crypto.randomBytes(32).toString('hex'),
        isVerified: true,
      });
    } else if(!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch(err) {
    console.error('Verify OTP error: ', err.message);
    res.status(500).json({
      message: 'Internal server error during OTP verification.'
    });
  }
}