const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency'],
    required: [true, 'Leave type is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewComments: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comments cannot exceed 500 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEmergency: {
    type: Boolean,
    default: false
  },
  replacementArranged: {
    type: Boolean,
    default: false
  },
  replacementEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for leave duration in days
leaveSchema.virtual('duration').get(function() {
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
});

// Virtual for days until leave starts
leaveSchema.virtual('daysUntilStart').get(function() {
  if (this.status !== 'Approved') return null;
  const today = new Date();
  const startDate = new Date(this.startDate);
  if (startDate <= today) return 0; // Leave has started or passed
  return Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
});

// Virtual for leave status description
leaveSchema.virtual('statusDescription').get(function() {
  const today = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  if (this.status !== 'Approved') return this.status;
  
  if (today < startDate) return 'Upcoming';
  if (today >= startDate && today <= endDate) return 'Active';
  return 'Completed';
});

// Indexes for performance
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ type: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ appliedDate: -1 });
leaveSchema.index({ reviewedAt: -1 });

// Pre-save middleware to set emergency flag
leaveSchema.pre('save', function(next) {
  this.isEmergency = this.type === 'Emergency';
  next();
});

// Instance method to approve leave
leaveSchema.methods.approve = function(reviewerId, comments = null) {
  this.status = 'Approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (comments) this.reviewComments = comments;
  return this.save();
};

// Instance method to reject leave
leaveSchema.methods.reject = function(reviewerId, comments = null) {
  this.status = 'Rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (comments) this.reviewComments = comments;
  return this.save();
};

// Instance method to check if leave overlaps with another leave
leaveSchema.methods.overlapsWith = function(otherLeave) {
  return (
    this.startDate <= otherLeave.endDate &&
    this.endDate >= otherLeave.startDate
  );
};

// Static method to find overlapping leaves
leaveSchema.statics.findOverlapping = function(employeeId, startDate, endDate, excludeId = null) {
  const query = {
    employeeId,
    status: { $in: ['Pending', 'Approved'] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

// Static method to find upcoming leaves
leaveSchema.statics.findUpcoming = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    status: 'Approved',
    startDate: {
      $gte: today,
      $lte: futureDate
    }
  }).populate('employeeId', 'name email skillLevel');
};

// Static method to find active leaves
leaveSchema.statics.findActive = function() {
  const today = new Date();
  
  return this.find({
    status: 'Approved',
    startDate: { $lte: today },
    endDate: { $gte: today }
  }).populate('employeeId', 'name email skillLevel');
};

// Static method to get leave statistics
leaveSchema.statics.getStatistics = function(startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.$or = [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ];
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalLeaves: { $sum: 1 },
        pendingLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        },
        approvedLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
        },
        rejectedLeaves: {
          $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
        },
        emergencyLeaves: {
          $sum: { $cond: [{ $eq: ['$type', 'Emergency'] }, 1, 0] }
        },
        totalDays: {
          $sum: {
            $add: [
              { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000 * 60 * 60 * 24] },
              1
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Leave', leaveSchema);