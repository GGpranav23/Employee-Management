const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(auth);

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type, employeeId, startDate, endDate } = req.query;

  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (employeeId) {
    query.employeeId = employeeId;
  }
  
  if (startDate && endDate) {
    query.$or = [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ];
  }

  // If user is not Team Lead, only show their own leaves
  if (req.user.role !== 'Team Lead' && req.user.employeeId) {
    query.employeeId = req.user.employeeId;
  }

  // Execute query with pagination
  const leaves = await Leave.find(query)
    .populate('employeeId', 'name email skillLevel')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Leave.countDocuments(query);

  res.status(200).json({
    success: true,
    count: leaves.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: leaves
  });
}));

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('employeeId', 'name email skillLevel');

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  // Users can only view their own leave requests unless they're Team Lead
  if (req.user.role !== 'Team Lead' && leave.employeeId._id.toString() !== req.user.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }

  res.status(200).json({
    success: true,
    data: leave
  });
}));

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
router.post('/', [
  body('employeeId')
    .isMongoId()
    .withMessage('Employee ID must be a valid MongoDB ObjectId'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('type')
    .isIn(['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency'])
    .withMessage('Type must be Sick Leave, Personal Leave, Vacation, or Emergency')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { employeeId, startDate, endDate, reason, type } = req.body;

  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Users can only create leave requests for themselves unless they're Team Lead
  if (req.user.role !== 'Team Lead' && employeeId !== req.user.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create leave request for this employee'
    });
  }

  // Check for overlapping leave requests
  const overlappingLeave = await Leave.findOne({
    employeeId,
    status: { $in: ['Pending', 'Approved'] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  });

  if (overlappingLeave) {
    return res.status(400).json({
      success: false,
      message: 'Employee already has a leave request for overlapping dates'
    });
  }

  // Check if start date is in the future (except for emergency leaves)
  if (type !== 'Emergency' && new Date(startDate) <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Leave start date must be in the future (except for emergency leaves)'
    });
  }

  const leave = await Leave.create({
    employeeId,
    employeeName: employee.name,
    startDate,
    endDate,
    reason,
    type,
    appliedDate: new Date()
  });

  await leave.populate('employeeId', 'name email skillLevel');

  res.status(201).json({
    success: true,
    data: leave
  });
}));

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private
router.put('/:id', [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('type')
    .optional()
    .isIn(['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency'])
    .withMessage('Type must be Sick Leave, Personal Leave, Vacation, or Emergency')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  // Users can only update their own leave requests unless they're Team Lead
  if (req.user.role !== 'Team Lead' && leave.employeeId.toString() !== req.user.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this leave request'
    });
  }

  // Can only update pending leave requests
  if (leave.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: 'Can only update pending leave requests'
    });
  }

  // Validate end date is after start date
  if (req.body.startDate && req.body.endDate) {
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
  }

  const updatedLeave = await Leave.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('employeeId', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: updatedLeave
  });
}));

// @desc    Approve/Reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Team Lead only)
router.put('/:id/status', authorize('Team Lead'), [
  body('status')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be Approved or Rejected'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review comments cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  if (leave.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: 'Leave request has already been reviewed'
    });
  }

  leave.status = req.body.status;
  leave.reviewedBy = req.user.id;
  leave.reviewedAt = new Date();
  
  if (req.body.reviewComments) {
    leave.reviewComments = req.body.reviewComments;
  }

  await leave.save();
  await leave.populate('employeeId', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: leave
  });
}));

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found'
    });
  }

  // Users can only delete their own leave requests unless they're Team Lead
  if (req.user.role !== 'Team Lead' && leave.employeeId.toString() !== req.user.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this leave request'
    });
  }

  // Can only delete pending leave requests
  if (leave.status !== 'Pending') {
    return res.status(400).json({
      success: false,
      message: 'Can only delete pending leave requests'
    });
  }

  await leave.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Leave request deleted successfully'
  });
}));

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private (Team Lead only)
router.get('/stats/overview', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const totalLeaves = await Leave.countDocuments();
  const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
  const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
  const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

  const leavesByType = await Leave.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const leavesByMonth = await Leave.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$startDate' },
          month: { $month: '$startDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Get upcoming approved leaves
  const upcomingLeaves = await Leave.find({
    status: 'Approved',
    startDate: { $gte: new Date() }
  })
  .populate('employeeId', 'name email')
  .sort({ startDate: 1 })
  .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      leavesByType,
      leavesByMonth,
      upcomingLeaves
    }
  });
}));

module.exports = router;