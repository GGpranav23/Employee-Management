const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Morning', 'General', 'Afternoon', 'Night', 'WeekendMorning', 'WeekendAfternoon', 'WeekendNight'],
    required: [true, 'Shift type is required']
  },
  date: {
    type: Date,
    required: [true, 'Shift date is required']
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  requirements: {
    seniors: {
      type: Number,
      required: [true, 'Senior requirement is required'],
      min: [0, 'Senior requirement cannot be negative']
    },
    juniors: {
      type: Number,
      required: [true, 'Junior requirement is required'],
      min: [0, 'Junior requirement cannot be negative']
    },
    alternateWith: {
      type: String,
      enum: ['senior', 'junior'],
      required: false
    }
  },
  isWeekend: {
    type: Boolean,
    default: false
  },
  replacements: [{
    originalEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    replacementEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    replacedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for shift duration (assuming 8-hour shifts)
shiftSchema.virtual('duration').get(function() {
  const shiftDurations = {
    'Morning': 8,
    'General': 8,
    'Afternoon': 8,
    'Night': 8,
    'WeekendMorning': 8,
    'WeekendAfternoon': 8,
    'WeekendNight': 8
  };
  return shiftDurations[this.type] || 8;
});

// Virtual for staffing status
shiftSchema.virtual('staffingStatus').get(function() {
  const requiredTotal = this.requirements.seniors + this.requirements.juniors;
  const actualTotal = this.employees.length;
  
  if (actualTotal === 0) return 'Unstaffed';
  if (actualTotal < requiredTotal) return 'Understaffed';
  if (actualTotal === requiredTotal) return 'Fully Staffed';
  return 'Overstaffed';
});

// Virtual for day of week
shiftSchema.virtual('dayOfWeek').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.date.getDay()];
});

// Indexes for performance
shiftSchema.index({ date: 1, type: 1 }, { unique: true }); // Prevent duplicate shifts
shiftSchema.index({ date: 1 });
shiftSchema.index({ type: 1 });
shiftSchema.index({ employees: 1 });
shiftSchema.index({ isWeekend: 1 });
shiftSchema.index({ status: 1 });

// Pre-save middleware to set weekend flag
shiftSchema.pre('save', function(next) {
  const dayOfWeek = this.date.getDay();
  this.isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  next();
});

// Instance method to add employee
shiftSchema.methods.addEmployee = function(employeeId) {
  if (!this.employees.includes(employeeId)) {
    this.employees.push(employeeId);
  }
  return this.save();
};

// Instance method to remove employee
shiftSchema.methods.removeEmployee = function(employeeId) {
  this.employees = this.employees.filter(id => !id.equals(employeeId));
  return this.save();
};

// Instance method to replace employee
shiftSchema.methods.replaceEmployee = function(originalEmployeeId, replacementEmployeeId, reason) {
  // Remove original employee
  this.employees = this.employees.filter(id => !id.equals(originalEmployeeId));
  
  // Add replacement employee
  this.employees.push(replacementEmployeeId);
  
  // Record the replacement
  this.replacements.push({
    originalEmployeeId,
    replacementEmployeeId,
    reason
  });
  
  return this.save();
};

// Instance method to check if fully staffed
shiftSchema.methods.isFullyStaffed = function() {
  const requiredTotal = this.requirements.seniors + this.requirements.juniors;
  return this.employees.length >= requiredTotal;
};

// Static method to find shifts by date range
shiftSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate('employees', 'name email skillLevel');
};

// Static method to find shifts by employee
shiftSchema.statics.findByEmployee = function(employeeId, startDate = null, endDate = null) {
  const query = { employees: employeeId };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query).populate('employees', 'name email skillLevel');
};

// Static method to get shift statistics
shiftSchema.statics.getStatistics = function(startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalShifts: { $sum: 1 },
        weekdayShifts: {
          $sum: { $cond: [{ $eq: ['$isWeekend', false] }, 1, 0] }
        },
        weekendShifts: {
          $sum: { $cond: [{ $eq: ['$isWeekend', true] }, 1, 0] }
        },
        fullyStaffedShifts: {
          $sum: {
            $cond: [
              { $gte: [{ $size: '$employees' }, { $add: ['$requirements.seniors', '$requirements.juniors'] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Shift', shiftSchema);