import { Employee, Task, Shift, User, Leave } from '../types';
import employeeData from './employees.json';

export const mockEmployees: Employee[] = employeeData.employees.map(emp => ({
  ...emp,
  weekendsOff: emp.weekendsOff as [string, string],
  weekendShiftHistory: []
}));

export const mockLeaves: Leave[] = employeeData.leaves;

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement User Authentication',
    description: 'Create a secure login system with JWT tokens',
    difficulty: 'Hard',
    skillRequired: 'React',
    assignedTo: '1',
    status: 'In Progress',
    createdDate: '2024-01-15',
    dueDate: '2024-01-25',
    priority: 'High',
    skillPointsReward: 50,
  },
  {
    id: '2',
    title: 'Design Database Schema',
    description: 'Design and implement the database structure',
    difficulty: 'Medium',
    skillRequired: 'PostgreSQL',
    assignedTo: '2',
    status: 'Completed',
    createdDate: '2024-01-10',
    dueDate: '2024-01-20',
    priority: 'High',
    skillPointsReward: 35,
  },
  {
    id: '3',
    title: 'Create Landing Page',
    description: 'Build a responsive landing page',
    difficulty: 'Easy',
    skillRequired: 'HTML',
    status: 'Pending',
    createdDate: '2024-01-18',
    dueDate: '2024-01-28',
    priority: 'Medium',
    skillPointsReward: 20,
  },
  {
    id: '4',
    title: 'API Integration',
    description: 'Integrate third-party payment API',
    difficulty: 'Hard',
    skillRequired: 'Node.js',
    assignedTo: '1',
    status: 'Pending',
    createdDate: '2024-01-20',
    dueDate: '2024-02-05',
    priority: 'High',
    skillPointsReward: 45,
  },
  {
    id: '5',
    title: 'Mobile Responsive Design',
    description: 'Make the application mobile-friendly',
    difficulty: 'Medium',
    skillRequired: 'CSS',
    assignedTo: '7',
    status: 'In Progress',
    createdDate: '2024-01-16',
    dueDate: '2024-01-30',
    priority: 'Medium',
    skillPointsReward: 30,
  },
];

export const currentUser: User = {
  id: 'lead1',
  name: 'Kishor Sandur',
  role: 'Team Lead',
  email: 'kishor@vectorconsulting.in',
};

// Updated shift requirements to include weekend shifts
export const shiftRequirements = {
  Morning: { seniors: 1, juniors: 1 },
  General: { seniors: 2, juniors: 3 },
  Afternoon: { seniors: 1, juniors: 1 },
  Night: { seniors: 1, juniors: 1 },
  // Weekend shifts with alternating senior/junior pattern
  WeekendMorning: { seniors: 1, juniors: 0, alternateWith: 'junior' },
  WeekendAfternoon: { seniors: 0, juniors: 1, alternateWith: 'senior' },
  WeekendNight: { seniors: 1, juniors: 0, alternateWith: 'junior' },
};

// Weekend shift rotation pattern
export const weekendShiftPattern = {
  Saturday: ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'],
  Sunday: ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'],
};