const router = require('express').Router();
const authController = require('../controllers/authController');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTHENTICATION ENDPOINTS ============
// Register with Email OTP
router.post('/register', authController.register);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Login
router.post('/login', authController.login);

// Get User Profile (Protected)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', verifyToken, (req, res) => {
  // In stateless JWT, logout is handled on client side
  // But we can track logout in login history if needed
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
