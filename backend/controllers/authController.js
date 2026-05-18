import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/emailService.js';

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

    // Send OTP via centralized Email Service
    const subject = `Your Login OTP for OmniFlow`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to OmniFlow</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Your One-Time Password (OTP) for secure login is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. For your security, please do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">OmniFlow - Your All-in-One Productivity Hub</p>
      </div>
    `;
    const textContent = `Your OmniFlow OTP is: ${otp}`;

    const emailSent = await sendEmail(user.email, subject, htmlContent, textContent);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email. Please check server configuration.' });
    }

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
      activeHousehold: user.activeHousehold,
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
    if (req.body.email) user.email = req.body.email;
    if (req.body.mentor_reminder_time) user.mentor_reminder_time = req.body.mentor_reminder_time;
    
    // Safely merge settings if provided
    if (req.body.settings) {
      user.settings = {
        notifications: { 
          ...user.settings?.notifications, 
          ...(req.body.settings.notifications || {}) 
        },
        appearance: { 
          ...user.settings?.appearance, 
          ...(req.body.settings.appearance || {}) 
        }
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      settings: updatedUser.settings,
      activeHousehold: updatedUser.activeHousehold,
      mentor_onboarded: updatedUser.mentor_onboarded,
      mentor_reminder_time: updatedUser.mentor_reminder_time,
      level: updatedUser.level,
      goal: updatedUser.goal,
      daily_time: updatedUser.daily_time,
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
