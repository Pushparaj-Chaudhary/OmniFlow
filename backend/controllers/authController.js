import User from '../models/User.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

// @desc    Request OTP for Login/Signup
// @route   POST /api/auth/request-otp
// @access  Public
export const requestOtp = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email });
    
    // If new user, create basic profile
    if (!user) {
      if (!name) return res.status(400).json({ message: 'Name is required for signup' });
      user = new User({ email, name });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save();

    // Send OTP via Brevo
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Omniflow App',
          email: process.env.EMAIL_USER
        },
        to: [
          {
            email: user.email,
            name: user.name
          }
        ],
        subject: `Your Login OTP for Omniflow`,
        htmlContent: `
          <h2>Welcome to Omniflow</h2>
          <p>Hi ${user.name},</p>
          <p>Your One-Time Password (OTP) for login is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes. Please do not share it with anyone.</p>
        `,
        textContent: `Your OTP is: ${otp}`
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('OTP Request Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP Valid. Clear DB OTP and issue token
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', {
      expiresIn: '7d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      settings: user.settings,
      token,
    });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// @desc    Update User Profile (Avatar/Name)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.email) user.email = req.body.email; // Note: For a live app, email updates need extra verification
    
    // Deep merge settings object
    if (req.body.settings) {
      user.settings = {
        notifications: { ...user.settings?.notifications, ...req.body.settings.notifications },
        appearance: { ...user.settings?.appearance, ...req.body.settings.appearance }
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      settings: updatedUser.settings,
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
