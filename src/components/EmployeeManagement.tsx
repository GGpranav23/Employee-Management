import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Mail,
  MapPin
} from 'lucide-react';
import { mockEmployees } from '../data/mockData';
import { Employee } from '../types';

const EmployeeManagement: React.FC = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState<'All' | 'Senior' | 'Junior'>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkillLevel = skillLevelFilter === 'All' || emp.skillLevel === skillLevelFilter;
    return matchesSearch && matchesSkillLevel;
  });

  const getSkillColor = (skill: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[skill.length % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
            <p className="text-gray-300">Manage your team and track skill development</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={skillLevelFilter}
              onChange={(e) => setSkillLevelFilter(e.target.value as 'All' | 'Senior' | 'Junior')}
              className="bg-white/5 border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Levels</option>
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{employee.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.skillLevel === 'Senior' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {employee.skillLevel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-400 mb-1">
                  <Star className="w-4 h-4 mr-1" />
                  <span className="text-sm font-semibold">{employee.skillPoints}</span>
                </div>
                <p className="text-xs text-gray-400">skill points</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center text-gray-300 text-sm mb-2">
                <Mail className="w-4 h-4 mr-2" />
                {employee.email}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {employee.tasksCompleted} tasks completed
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {employee.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
                {employee.skills.length > 3 && (
                  <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-white/10 rounded-full">
                    +{employee.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-semibold">{Math.min(100, Math.floor(employee.skillPoints / 10))}%</span>
              </div>
              <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.floor(employee.skillPoints / 10))}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                  <p className="text-gray-400">{selectedEmployee.email}</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${
                    selectedEmployee.skillLevel === 'Senior' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedEmployee.skillLevel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">Skill Points</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{selectedEmployee.skillPoints}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-white font-semibold">Tasks Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{selectedEmployee.tasksCompleted}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedEmployee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Weekend Schedule</h3>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300">Next weekend off: {selectedEmployee.weekendsOff.join(' - ')}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;