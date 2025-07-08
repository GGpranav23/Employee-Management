import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  ShieldCheck,
  Database,
  BarChart3,
  FileText,
  AlertCircle,
  Activity,
  Zap,
  Clock
} from 'lucide-react';
import { mockEmployees, mockTasks } from '../data/mockData';
import { TaskAssigner } from '../utils/taskAssigner';
import { ShiftAllocator } from '../utils/shiftAllocator';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const taskAssigner = new TaskAssigner(mockEmployees);
  const shiftAllocator = new ShiftAllocator(mockEmployees);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const systemStats = {
    totalUsers: mockEmployees.length,
    activeTasks: mockTasks.filter(t => t.status !== 'Completed').length,
    completionRate: Math.round((mockTasks.filter(t => t.status === 'Completed').length / mockTasks.length) * 100),
    systemUptime: '99.9%',
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{systemStats.totalUsers}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Total Users</h3>
            <p className="text-gray-400 text-sm">Active employees</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{systemStats.activeTasks}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Active Tasks</h3>
            <p className="text-gray-400 text-sm">In progress</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{systemStats.completionRate}%</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Completion Rate</h3>
            <p className="text-gray-400 text-sm">This month</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{systemStats.systemUptime}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">System Uptime</h3>
            <p className="text-gray-400 text-sm">Last 30 days</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          System Activity Log
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Automatic task assignment completed</p>
              <p className="text-gray-400 text-sm">5 tasks assigned to team members - 15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Weekly shift schedule generated</p>
              <p className="text-gray-400 text-sm">All shifts allocated successfully - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">System backup completed</p>
              <p className="text-gray-400 text-sm">All data backed up successfully - 6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          User Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Senior Employees</h3>
            {mockEmployees.filter(emp => emp.skillLevel === 'Senior').map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{employee.name}</p>
                    <p className="text-gray-400 text-sm">{employee.tasksCompleted} tasks</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Manage</button>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Junior Employees</h3>
            {mockEmployees.filter(emp => emp.skillLevel === 'Junior').map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{employee.name}</p>
                    <p className="text-gray-400 text-sm">{employee.tasksCompleted} tasks</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          System Configuration
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Task Assignment Algorithm</h3>
              <p className="text-gray-400 text-sm mb-3">Configure automatic task assignment parameters</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Skill Matching Weight</span>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Workload Balance Weight</span>
                  <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">Shift Requirements</h3>
              <p className="text-gray-400 text-sm mb-3">Modify shift staffing requirements</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Morning Shift</span>
                  <span className="text-white">1 Senior, 1 Junior</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">General Shift</span>
                  <span className="text-white">2 Senior, 3 Junior</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Afternoon Shift</span>
                  <span className="text-white">1 Senior, 1 Junior</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Night Shift</span>
                  <span className="text-white">1 Senior, 1 Junior</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Security Settings
              </h3>
              <p className="text-gray-400 text-sm mb-3">Configure system security parameters</p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-gray-300">Enable audit logging</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-gray-300">Require 2FA for admin access</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-300">Enable data encryption</span>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Management
              </h3>
              <p className="text-gray-400 text-sm mb-3">Manage system data and backups</p>
              <div className="space-y-2">
                <button className="w-full p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                  Create Backup
                </button>
                <button className="w-full p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors">
                  Export Data
                </button>
                <button className="w-full p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          System Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Employee Performance</h3>
            <p className="text-gray-400 text-sm mb-4">Detailed analysis of employee productivity and skill development</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Generate Report →</button>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Task Analytics</h3>
            <p className="text-gray-400 text-sm mb-4">Task completion rates, assignment efficiency, and workload distribution</p>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Generate Report →</button>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Shift Optimization</h3>
            <p className="text-gray-400 text-sm mb-4">Shift coverage analysis, scheduling efficiency, and resource utilization</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">Generate Report →</button>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Team Productivity</h3>
            <p className="text-gray-400 text-sm mb-4">Overall team performance metrics and improvement recommendations</p>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">Generate Report →</button>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Security Audit</h3>
            <p className="text-gray-400 text-sm mb-4">System access logs, security events, and compliance reports</p>
            <button className="text-teal-400 hover:text-teal-300 text-sm font-medium">Generate Report →</button>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">System Health</h3>
            <p className="text-gray-400 text-sm mb-4">System performance, uptime statistics, and resource usage</p>
            <button className="text-pink-400 hover:text-pink-300 text-sm font-medium">Generate Report →</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'system':
        return renderSystemSettings();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-300">System administration and configuration</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;