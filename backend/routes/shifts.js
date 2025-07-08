const express = require('express');
const { body, validationResult } = require('express-validator');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// All routes are protected
router.use(auth);

// @desc    Get shifts for a specific week
// @route   GET /api/shifts
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { weekStart, weekEnd, employeeId } = req.query;

  // Build query
  const query = {};
  
  if (weekStart && weekEnd) {
    query.date = {
      $gte: new Date(weekStart),
      $lte: new Date(weekEnd)
    };
  }
  
  if (employeeId) {
    query.employees = employeeId;
  }

  const shifts = await Shift.find(query)
    .populate('employees', 'name email skillLevel')
    .sort({ date: 1, type: 1 });

  res.status(200).json({
    success: true,
    count: shifts.length,
    data: shifts
  });
}));

// @desc    Get single shift
// @route   GET /api/shifts/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id)
    .populate('employees', 'name email skillLevel');

  if (!shift) {
    return res.status(404).json({
      success: false,
      message: 'Shift not found'
    });
  }

  res.status(200).json({
    success: true,
    data: shift
  });
}));

// @desc    Create shift
// @route   POST /api/shifts
// @access  Private (Team Lead only)
router.post('/', authorize('Team Lead'), [
  body('type')
    .isIn(['Morning', 'General', 'Afternoon', 'Night', 'WeekendMorning', 'WeekendAfternoon', 'WeekendNight'])
    .withMessage('Invalid shift type'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('employees')
    .isArray()
    .withMessage('Employees must be an array'),
  body('requirements.seniors')
    .isInt({ min: 0 })
    .withMessage('Senior requirement must be a non-negative integer'),
  body('requirements.juniors')
    .isInt({ min: 0 })
    .withMessage('Junior requirement must be a non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if shift already exists for this date and type
  const existingShift = await Shift.findOne({
    type: req.body.type,
    date: req.body.date
  });

  if (existingShift) {
    return res.status(400).json({
      success: false,
      message: 'Shift already exists for this date and type'
    });
  }

  // Validate employees exist and are available
  if (req.body.employees.length > 0) {
    const employees = await Employee.find({
      _id: { $in: req.body.employees },
      isActive: true
    });

    if (employees.length !== req.body.employees.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more employees not found or inactive'
      });
    }

    // Check if employees are on leave
    const leaves = await Leave.find({
      employeeId: { $in: req.body.employees },
      status: 'Approved',
      startDate: { $lte: req.body.date },
      endDate: { $gte: req.body.date }
    });

    if (leaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more employees are on approved leave for this date'
      });
    }
  }

  const shift = await Shift.create(req.body);
  await shift.populate('employees', 'name email skillLevel');

  res.status(201).json({
    success: true,
    data: shift
  });
}));

// @desc    Update shift
// @route   PUT /api/shifts/:id
// @access  Private (Team Lead only)
router.put('/:id', authorize('Team Lead'), [
  body('employees')
    .optional()
    .isArray()
    .withMessage('Employees must be an array'),
  body('requirements.seniors')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Senior requirement must be a non-negative integer'),
  body('requirements.juniors')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Junior requirement must be a non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const shift = await Shift.findById(req.params.id);

  if (!shift) {
    return res.status(404).json({
      success: false,
      message: 'Shift not found'
    });
  }

  // Validate employees if provided
  if (req.body.employees) {
    const employees = await Employee.find({
      _id: { $in: req.body.employees },
      isActive: true
    });

    if (employees.length !== req.body.employees.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more employees not found or inactive'
      });
    }

    // Check if employees are on leave
    const leaves = await Leave.find({
      employeeId: { $in: req.body.employees },
      status: 'Approved',
      startDate: { $lte: shift.date },
      endDate: { $gte: shift.date }
    });

    if (leaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more employees are on approved leave for this date'
      });
    }
  }

  const updatedShift = await Shift.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('employees', 'name email skillLevel');

  res.status(200).json({
    success: true,
    data: updatedShift
  });
}));

// @desc    Delete shift
// @route   DELETE /api/shifts/:id
// @access  Private (Team Lead only)
router.delete('/:id', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);

  if (!shift) {
    return res.status(404).json({
      success: false,
      message: 'Shift not found'
    });
  }

  await shift.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Shift deleted successfully'
  });
}));

// @desc    Generate weekly shifts
// @route   POST /api/shifts/generate-week
// @access  Private (Team Lead only)
router.post('/generate-week', authorize('Team Lead'), [
  body('weekStart')
    .isISO8601()
    .withMessage('Week start must be a valid date')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { weekStart } = req.body;
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  // Check if shifts already exist for this week
  const existingShifts = await Shift.find({
    date: {
      $gte: weekStartDate,
      $lte: weekEndDate
    }
  });

  if (existingShifts.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Shifts already exist for this week'
    });
  }

  // Get all active employees
  const employees = await Employee.find({ isActive: true });

  // Get approved leaves for this week
  const leaves = await Leave.find({
    status: 'Approved',
    $or: [
      {
        startDate: { $lte: weekEndDate },
        endDate: { $gte: weekStartDate }
      }
    ]
  });

  // Shift requirements
  const shiftRequirements = {
    Morning: { seniors: 1, juniors: 1 },
    General: { seniors: 2, juniors: 3 },
    Afternoon: { seniors: 1, juniors: 1 },
    Night: { seniors: 1, juniors: 1 },
    WeekendMorning: { seniors: 1, juniors: 0 },
    WeekendAfternoon: { seniors: 0, juniors: 1 },
    WeekendNight: { seniors: 1, juniors: 0 }
  };

  const generatedShifts = [];

  // Generate shifts for each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const shiftTypes = isWeekend 
      ? ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight']
      : ['Morning', 'General', 'Afternoon', 'Night'];

    // Get employees available for this date
    const employeesOnLeave = leaves
      .filter(leave => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      })
      .map(leave => leave.employeeId.toString());

    const availableEmployees = employees.filter(emp => 
      !employeesOnLeave.includes(emp._id.toString())
    );

    const usedEmployees = new Set();

    for (const shiftType of shiftTypes) {
      const requirements = shiftRequirements[shiftType];
      const assignedEmployees = [];

      // Assign senior employees
      const availableSeniors = availableEmployees.filter(emp => 
        emp.skillLevel === 'Senior' && !usedEmployees.has(emp._id.toString())
      );
      
      for (let j = 0; j < requirements.seniors && j < availableSeniors.length; j++) {
        assignedEmployees.push(availableSeniors[j]._id);
        usedEmployees.add(availableSeniors[j]._id.toString());
      }

      // Assign junior employees
      const availableJuniors = availableEmployees.filter(emp => 
        emp.skillLevel === 'Junior' && !usedEmployees.has(emp._id.toString())
      );
      
      for (let j = 0; j < requirements.juniors && j < availableJuniors.length; j++) {
        assignedEmployees.push(availableJuniors[j]._id);
        usedEmployees.add(availableJuniors[j]._id.toString());
      }

      const shift = {
        type: shiftType,
        date: currentDate,
        employees: assignedEmployees,
        requirements,
        isWeekend
      };

      generatedShifts.push(shift);
    }
  }

  // Create all shifts
  const createdShifts = await Shift.insertMany(generatedShifts);

  // Populate employee details
  const populatedShifts = await Shift.find({
    _id: { $in: createdShifts.map(shift => shift._id) }
  }).populate('employees', 'name email skillLevel');

  res.status(201).json({
    success: true,
    count: populatedShifts.length,
    data: populatedShifts
  });
}));

// @desc    Get shift statistics
// @route   GET /api/shifts/stats
// @access  Private (Team Lead only)
router.get('/stats/overview', authorize('Team Lead'), asyncHandler(async (req, res) => {
  const { weekStart, weekEnd } = req.query;

  let dateQuery = {};
  if (weekStart && weekEnd) {
    dateQuery = {
      date: {
        $gte: new Date(weekStart),
        $lte: new Date(weekEnd)
      }
    };
  }

  const totalShifts = await Shift.countDocuments(dateQuery);
  const weekdayShifts = await Shift.countDocuments({
    ...dateQuery,
    isWeekend: { $ne: true }
  });
  const weekendShifts = await Shift.countDocuments({
    ...dateQuery,
    isWeekend: true
  });

  const shiftsByType = await Shift.aggregate([
    { $match: dateQuery },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const employeeWorkload = await Shift.aggregate([
    { $match: dateQuery },
    { $unwind: '$employees' },
    { $group: { _id: '$employees', shiftCount: { $sum: 1 } } },
    { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
    { $unwind: '$employee' },
    { $project: { name: '$employee.name', shiftCount: 1 } },
    { $sort: { shiftCount: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalShifts,
      weekdayShifts,
      weekendShifts,
      shiftsByType,
      employeeWorkload
    }
  });
}));

module.exports = router;