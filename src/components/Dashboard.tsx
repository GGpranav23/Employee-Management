import React from 'react';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Activity
} from 'lucide-react';
import { mockEmployees, mockTasks } from '../data/mockData';
import { ShiftAllocator } from '../utils/shiftAllocator';

const Dashboard: React.FC = () => {
  const totalEmployees = mockEmployees.length;
  const seniorEmployees = mockEmployees.filter(emp => emp.skillLevel === 'Senior').length;
  const juniorEmployees = mockEmployees.filter(emp => emp.skillLevel === 'Junior').length;
  
  const completedTasks = mockTasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = mockTasks.filter(task => task.status === 'In Progress').length;
  const pendingTasks = mockTasks.filter(task => task.status === 'Pending').length;
  
  const shiftAllocator = new ShiftAllocator(mockEmployees);
  const currentWeekShifts = shiftAllocator.allocateShifts('2024-01-22');
  const shiftStats = shiftAllocator.getShiftStats(currentWeekShifts);

  const topPerformers = [...mockEmployees]
    .sort((a, b) => b.skillPoints - a.skillPoints)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      subtitle: `${seniorEmployees} Senior, ${juniorEmployees} Junior`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/10',
    },
    {
      title: 'Active Tasks',
      value: mockTasks.length,
      subtitle: `${completedTasks} completed this week`,
      icon: CheckSquare,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-500/10 to-emerald-600/10',
    },
    {
      title: 'Weekly Shifts',
      value: currentWeekShifts.length,
      subtitle: 'Across 4 shift types',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/10 to-purple-600/10',
    },
    {
      title: 'Efficiency Rate',
      value: '94%',
      subtitle: 'Up 5% from last week',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/10 to-orange-600/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-300">Welcome back! Here's what's happening with your team today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-300 text-sm font-medium mb-2">{stat.title}</p>
                <p className="text-gray-400 text-xs">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Overview */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Task Status Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-300">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-semibold mr-2">{completedTasks}</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(completedTasks / mockTasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-300">In Progress</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-semibold mr-2">{inProgressTasks}</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(inProgressTasks / mockTasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-300">Pending</span>
              </div>
              <div className="flex items-center">
                <span className="text-white font-semibold mr-2">{pendingTasks}</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(pendingTasks / mockTasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Top Performers
          </h2>
          <div className="space-y-4">
            {topPerformers.map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{employee.name}</p>
                    <p className="text-gray-400 text-sm">{employee.skillLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{employee.skillPoints}</p>
                  <p className="text-gray-400 text-xs">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Task "Design Database Schema" completed by Sanjay</p>
              <p className="text-gray-400 text-sm">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">New task "Mobile Responsive Design" assigned to Kalpita</p>
              <p className="text-gray-400 text-sm">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Weekly shift schedule generated for next week</p>
              <p className="text-gray-400 text-sm">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;