const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(auth);

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Team Lead only)
router.get('/', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Execute query with pagination
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: users
  });
}));

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Users can only view their own profile unless they're Team Lead
  if (req.user.role !== 'Team Lead' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['Team Lead', 'Employee'])
    .withMessage('Role must be either Team Lead or Employee')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Users can only update their own profile unless they're Team Lead
  if (req.user.role !== 'Team Lead' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this resource'
    });
  }

  // Only Team Lead can update role
  if (req.body.role && req.user.role !== 'Team Lead') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update user role'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if email is already taken by another user
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.emailExists(req.body.email);
    if (existingUser && existingUser._id.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Team Lead only)
router.delete('/:id', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting own account
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private (Team Lead only)
router.put('/:id/deactivate', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deactivating own account
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate your own account'
    });
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @desc    Activate user
// @route   PUT /api/users/:id/activate
// @access  Private (Team Lead only)
router.put('/:id/activate', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User activated successfully'
  });
}));

module.exports = router;