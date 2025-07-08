const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Leave = require('../models/Leave');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Kishor Sandur',
    email: 'kishor@vectorconsulting.in',
    password: 'admin123',
    role: 'Team Lead'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    password: 'admin123',
    role: 'Team Lead'
  }
];

const employees = [
  {
    name: 'Ketan',
    email: 'ketan@company.com',
    skillLevel: 'Senior',
    skills: ['React', 'TypeScript', 'Node.js', 'Team Leadership'],
    tasksCompleted: 52,
    skillPoints: 920,
    department: 'Frontend Development',
    phone: '+91-9876543210',
    weekendsOff: []
  },
  {
    name: 'Kiran',
    email: 'kiran@company.com',
    skillLevel: 'Senior',
    skills: ['Python', 'Django', 'PostgreSQL', 'System Architecture'],
    tasksCompleted: 48,
    skillPoints: 880,
    department: 'Backend Development',
    phone: '+91-9876543211',
    weekendsOff: []
  },
  {
    name: 'Sayali',
    email: 'sayali@company.com',
    skillLevel: 'Senior',
    skills: ['Vue.js', 'Laravel', 'MySQL', 'Project Management'],
    tasksCompleted: 45,
    skillPoints: 850,
    department: 'Full Stack Development',
    phone: '+91-9876543212',
    weekendsOff: []
  },
  {
    name: 'Sanjay',
    email: 'sanjay@company.com',
    skillLevel: 'Senior',
    skills: ['Angular', 'TypeScript', 'Firebase', 'DevOps'],
    tasksCompleted: 50,
    skillPoints: 900,
    department: 'Frontend Development',
    phone: '+91-9876543213',
    weekendsOff: []
  },
  {
    name: 'Nitin',
    email: 'nitin@company.com',
    skillLevel: 'Senior',
    skills: ['Java', 'Spring Boot', 'MongoDB', 'Microservices'],
    tasksCompleted: 47,
    skillPoints: 870,
    department: 'Backend Development',
    phone: '+91-9876543214',
    weekendsOff: []
  },
  {
    name: 'Shubham',
    email: 'shubham@company.com',
    skillLevel: 'Senior',
    skills: ['C#', '.NET', 'SQL Server', 'Cloud Architecture'],
    tasksCompleted: 44,
    skillPoints: 840,
    department: 'Backend Development',
    phone: '+91-9876543215',
    weekendsOff: []
  },
  {
    name: 'RamKishan',
    email: 'ramkishan@company.com',
    skillLevel: 'Junior',
    skills: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
    tasksCompleted: 28,
    skillPoints: 480,
    department: 'Frontend Development',
    phone: '+91-9876543216',
    weekendsOff: []
  },
  {
    name: 'Pranav',
    email: 'pranav@company.com',
    skillLevel: 'Junior',
    skills: ['React', 'CSS', 'Git', 'Testing'],
    tasksCompleted: 25,
    skillPoints: 450,
    department: 'Frontend Development',
    phone: '+91-9876543217',
    weekendsOff: []
  },
  {
    name: 'Parshwa',
    email: 'parshwa@company.com',
    skillLevel: 'Junior',
    skills: ['JavaScript', 'HTML', 'Bootstrap', 'jQuery'],
    tasksCompleted: 22,
    skillPoints: 420,
    department: 'Frontend Development',
    phone: '+91-9876543218',
    weekendsOff: []
  },
  {
    name: 'Kalpita',
    email: 'kalpita@company.com',
    skillLevel: 'Junior',
    skills: ['Python', 'Django', 'PostgreSQL', 'API Development'],
    tasksCompleted: 32,
    skillPoints: 520,
    department: 'Backend Development',
    phone: '+91-9876543219',
    weekendsOff: []
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});

    console.log('Cleared existing data...');

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log('Users created...');

    // Create employees
    const createdEmployees = await Employee.insertMany(employees);
    console.log('Employees created...');

    // Create sample tasks
    const tasks = [
      {
        title: 'Implement User Authentication',
        description: 'Create a secure login system with JWT tokens',
        difficulty: 'Hard',
        skillRequired: 'React',
        assignedTo: createdEmployees[0]._id,
        createdBy: createdUsers[0]._id,
        status: 'In Progress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'High',
        skillPointsReward: 50
      },
      {
        title: 'Design Database Schema',
        description: 'Design and implement the database structure',
        difficulty: 'Medium',
        skillRequired: 'PostgreSQL',
        assignedTo: createdEmployees[1]._id,
        createdBy: createdUsers[0]._id,
        status: 'Completed',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'High',
        skillPointsReward: 35,
        completedAt: new Date()
      },
      {
        title: 'Create Landing Page',
        description: 'Build a responsive landing page',
        difficulty: 'Easy',
        skillRequired: 'HTML',
        createdBy: createdUsers[0]._id,
        status: 'Pending',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        skillPointsReward: 20
      },
      {
        title: 'API Integration',
        description: 'Integrate third-party payment API',
        difficulty: 'Hard',
        skillRequired: 'Node.js',
        assignedTo: createdEmployees[0]._id,
        createdBy: createdUsers[0]._id,
        status: 'Pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'High',
        skillPointsReward: 45
      },
      {
        title: 'Mobile Responsive Design',
        description: 'Make the application mobile-friendly',
        difficulty: 'Medium',
        skillRequired: 'CSS',
        assignedTo: createdEmployees[6]._id,
        createdBy: createdUsers[0]._id,
        status: 'In Progress',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        skillPointsReward: 30
      }
    ];

    await Task.insertMany(tasks);
    console.log('Tasks created...');

    // Create sample leaves
    const leaves = [
      {
        employeeId: createdEmployees[2]._id,
        employeeName: 'Sayali',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        reason: 'Medical appointment and recovery',
        status: 'Approved',
        type: 'Sick Leave',
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reviewedBy: createdUsers[0]._id,
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        employeeId: createdEmployees[7]._id,
        employeeName: 'Pranav',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'Personal work',
        status: 'Pending',
        type: 'Personal Leave',
        appliedDate: new Date()
      },
      {
        employeeId: createdEmployees[4]._id,
        employeeName: 'Nitin',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        reason: 'Family vacation',
        status: 'Pending',
        type: 'Vacation',
        appliedDate: new Date()
      }
    ];

    await Leave.insertMany(leaves);
    console.log('Leaves created...');

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Team Lead: kishor@vectorconsulting.in / admin123');
    console.log('Team Lead: sarah@company.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();