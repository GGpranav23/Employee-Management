export interface Employee {
  id: string;
  name: string;
  email: string;
  skillLevel: 'Junior' | 'Senior';
  skills: string[];
  tasksCompleted: number;
  weekendsOff: [string, string]; // [Saturday, Sunday] dates
  currentShift?: ShiftType;
  skillPoints: number;
  joinDate: string;
  department: string;
  phone: string;
  avatar?: string;
  weekendShiftHistory?: WeekendShiftRecord[];
  canPromoteToSenior?: boolean;
  promotionEligible?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  skillRequired: string;
  assignedTo?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdDate: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  skillPointsReward: number;
}

export type ShiftType = 'Morning' | 'General' | 'Afternoon' | 'Night' | 'WeekendMorning' | 'WeekendAfternoon' | 'WeekendNight';

export interface Shift {
  id: string;
  type: ShiftType;
  date: string;
  employees: string[];
  requirements: {
    seniors: number;
    juniors: number;
    alternateWith?: 'senior' | 'junior';
  };
  isWeekend?: boolean;
  replacements?: ShiftReplacement[];
}

export interface WeekendShiftRecord {
  date: string;
  shiftType: ShiftType;
  employeeLevel: 'Senior' | 'Junior';
}

export interface ShiftSchedule {
  week: string;
  shifts: Shift[];
}

export interface User {
  id: string;
  name: string;
  role: 'Team Lead' | 'Employee';
  email: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  type: 'Sick Leave' | 'Personal Leave' | 'Vacation' | 'Emergency';
  appliedDate: string;
}

export interface ShiftReplacement {
  originalEmployeeId: string;
  replacementEmployeeId: string;
  reason: string;
  date: string;
}