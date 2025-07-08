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
  avatar?: string;
  weekendShiftHistory?: WeekendShiftRecord[];
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