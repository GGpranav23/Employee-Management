const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(auth);

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, skillLevel, department } = req.query;

  // Build query
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (skillLevel) {
    query.skillLevel = skillLevel;
  }
  
  if (department) {
    query.department = department;
  }

  // Execute query with pagination
  const employees = await Employee.find(query)
    .populate('userId', 'name email isActive')
    .sort({ skillPoints: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Employee.countDocuments(query);

  res.status(200).json({
    success: true,
    count: employees.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: employees
  });
}));

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('userId', 'name email isActive lastLogin');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  res.status(200).json({
    success: true,
    data: employee
  });
}));

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (Team Lead only)
router.post('/', authorize('Team Lead'), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('skillLevel')
    .isIn(['Junior', 'Senior'])
    .withMessage('Skill level must be Junior or Senior'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('skills')
    .isArray()
    .withMessage('Skills must be an array'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if employee with email already exists
  const existingEmployee = await Employee.findOne({ email: req.body.email });
  if (existingEmployee) {
    return res.status(400).json({
      success: false,
      message: 'Employee with this email already exists'
    });
  }

  const employee = await Employee.create(req.body);

  res.status(201).json({
    success: true,
    data: employee
  });
}));

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Team Lead only)
router.put('/:id', authorize('Team Lead'), [
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
  body('skillLevel')
    .optional()
    .isIn(['Junior', 'Senior'])
    .withMessage('Skill level must be Junior or Senior'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department must be between 2 and 50 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Check if email is already taken by another employee
  if (req.body.email && req.body.email !== employee.email) {
    const existingEmployee = await Employee.findOne({ email: req.body.email });
    if (existingEmployee && existingEmployee._id.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: updatedEmployee
  });
}));

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Team Lead only)
router.delete('/:id', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  await employee.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully'
  });
}));

// @desc    Update employee skill points
// @route   PUT /api/employees/:id/skill-points
// @access  Private (Team Lead only)
router.put('/:id/skill-points', authorize('Team Lead'), [
  body('points')
    .isInt({ min: 0 })
    .withMessage('Points must be a positive integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  employee.skillPoints = req.body.points;
  await employee.save();

  res.status(200).json({
    success: true,
    data: employee
  });
}));

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private (Team Lead only)
router.get('/stats/overview', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const totalEmployees = await Employee.countDocuments({ isActive: true });
  const seniorEmployees = await Employee.countDocuments({ skillLevel: 'Senior', isActive: true });
  const juniorEmployees = await Employee.countDocuments({ skillLevel: 'Junior', isActive: true });
  
  const topPerformers = await Employee.find({ isActive: true })
    .sort({ skillPoints: -1 })
    .limit(5)
    .select('name skillPoints skillLevel');

  const departmentStats = await Employee.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      seniorEmployees,
      juniorEmployees,
      topPerformers,
      departmentStats
    }
  });
}));

module.exports = router;