const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not all employees need to have user accounts
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  skillLevel: {
    type: String,
    enum: ['Junior', 'Senior'],
    required: [true, 'Skill level is required']
  },
  skills: [{
    type: String,
    trim: true
  }],
  tasksCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Tasks completed cannot be negative']
  },
  skillPoints: {
    type: Number,
    default: 0,
    min: [0, 'Skill points cannot be negative']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department cannot be more than 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  weekendsOff: [{
    type: Date
  }],
  weekendShiftHistory: [{
    date: {
      type: Date,
      required: true
    },
    shiftType: {
      type: String,
      enum: ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'],
      required: true
    },
    employeeLevel: {
      type: String,
      enum: ['Senior', 'Junior'],
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    lastShiftAssigned: Date,
    totalShiftsWorked: {
      type: Number,
      default: 0
    },
    weekendShiftsWorked: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full employee profile
employeeSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    skillLevel: this.skillLevel,
    skills: this.skills,
    tasksCompleted: this.tasksCompleted,
    skillPoints: this.skillPoints,
    department: this.department
  };
});

// Virtual for weekend shift count
employeeSchema.virtual('weekendShiftCount').get(function() {
  return this.weekendShiftHistory ? this.weekendShiftHistory.length : 0;
});

// Indexes for performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ skillLevel: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ skillPoints: -1 });
employeeSchema.index({ isActive: 1 });

// Instance method to add weekend shift
employeeSchema.methods.addWeekendShift = function(date, shiftType) {
  this.weekendShiftHistory.push({
    date,
    shiftType,
    employeeLevel: this.skillLevel
  });
  this.metadata.weekendShiftsWorked += 1;
  return this.save();
};

// Instance method to check availability for date
employeeSchema.methods.isAvailableForDate = function(date) {
  const checkDate = new Date(date);
  return !this.weekendsOff.some(offDate => {
    const offDateObj = new Date(offDate);
    return offDateObj.toDateString() === checkDate.toDateString();
  });
};

// Static method to find available employees for shift
employeeSchema.statics.findAvailableForShift = function(date, skillLevel = null) {
  const query = {
    isActive: true,
    weekendsOff: { $ne: date }
  };
  
  if (skillLevel) {
    query.skillLevel = skillLevel;
  }
  
  return this.find(query);
};

// Static method to get top performers
employeeSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ skillPoints: -1, tasksCompleted: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Employee', employeeSchema);