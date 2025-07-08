const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(auth);

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, difficulty, assignedTo, search } = req.query;

  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skillRequired: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email skillLevel')
    .populate('createdBy', 'name email')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Task.countDocuments(query);

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: tasks
  });
}));

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email skillLevel')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
}));

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Team Lead only)
router.post('/', authorize('Team Lead'), [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('skillRequired')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill required must be between 2 and 50 characters'),
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('skillPointsReward')
    .isInt({ min: 1, max: 100 })
    .withMessage('Skill points reward must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Add created by field
  req.body.createdBy = req.user.id;

  const task = await Task.create(req.body);

  // Populate the created task
  await task.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: task
  });
}));

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Team Lead only)
router.put('/:id', authorize('Team Lead'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('skillRequired')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Skill required must be between 2 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('skillPointsReward')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Skill points reward must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('assignedTo', 'name email skillLevel')
   .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    data: updatedTask
  });
}));

// @desc    Assign task to employee
// @route   PUT /api/tasks/:id/assign
// @access  Private (Team Lead only)
router.put('/:id/assign', authorize('Team Lead'), [
  body('employeeId')
    .isMongoId()
    .withMessage('Employee ID must be a valid MongoDB ObjectId')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const task = await Task.findById(req.params.id);
  const employee = await Employee.findById(req.body.employeeId);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Check if employee has required skill
  if (!employee.skills.includes(task.skillRequired)) {
    return res.status(400).json({
      success: false,
      message: 'Employee does not have the required skill for this task'
    });
  }

  task.assignedTo = req.body.employeeId;
  task.status = 'In Progress';
  await task.save();

  await task.populate('assignedTo', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: task
  });
}));

// @desc    Complete task
// @route   PUT /api/tasks/:id/complete
// @access  Private
router.put('/:id/complete', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Only assigned employee or team lead can complete task
  if (req.user.role !== 'Team Lead' && task.assignedTo?.toString() !== req.user.employeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this task'
    });
  }

  task.status = 'Completed';
  task.completedAt = new Date();
  await task.save();

  // Award skill points to employee
  if (task.assignedTo) {
    const employee = await Employee.findById(task.assignedTo);
    if (employee) {
      employee.skillPoints += task.skillPointsReward;
      employee.tasksCompleted += 1;
      await employee.save();
    }
  }

  await task.populate('assignedTo', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: task
  });
}));

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Team Lead only)
router.delete('/:id', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private (Team Lead only)
router.get('/stats/overview', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'Completed' });
  const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
  const pendingTasks = await Task.countDocuments({ status: 'Pending' });

  const tasksByPriority = await Task.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const tasksByDifficulty = await Task.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      tasksByPriority,
      tasksByDifficulty
    }
  });
}));

// @desc    Auto-assign task
// @route   POST /api/tasks/:id/auto-assign
// @access  Private (Team Lead only)
router.post('/:id/auto-assign', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  if (task.assignedTo) {
    return res.status(400).json({
      success: false,
      message: 'Task is already assigned'
    });
  }

  // Find employees with required skill
  const eligibleEmployees = await Employee.find({
    skills: task.skillRequired,
    isActive: true
  }).sort({ tasksCompleted: 1, skillPoints: -1 }); // Prefer employees with fewer tasks but higher skill points

  if (eligibleEmployees.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No eligible employees found for this task'
    });
  }

  // Simple assignment logic - assign to employee with least tasks
  const assignedEmployee = eligibleEmployees[0];

  task.assignedTo = assignedEmployee._id;
  task.status = 'In Progress';
  await task.save();

  await task.populate('assignedTo', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: task,
    message: `Task assigned to ${assignedEmployee.name}`
  });
}));

module.exports = router;