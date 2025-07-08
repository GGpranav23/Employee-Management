import React, { useState } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, User, AlertCircle, Clock, Star, AlignCenter as Assignment } from 'lucide-react';
import { mockTasks, mockEmployees } from '../data/mockData';
import { Task, Employee } from '../types';
import { TaskAssigner } from '../utils/taskAssigner';

const TaskManagement: React.FC = () => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const taskAssigner = new TaskAssigner(employees);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/20 text-red-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'Hard':
        return 'from-red-500 to-red-600';
      case 'Medium':
        return 'from-yellow-500 to-yellow-600';
      case 'Easy':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAssignedEmployee = (employeeId?: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const autoAssignTask = (task: Task) => {
    const assignedEmployeeId = taskAssigner.assignTask(task);
    if (assignedEmployeeId) {
      const employee = getAssignedEmployee(assignedEmployeeId);
      alert(`Task automatically assigned to ${employee?.name}`);
    } else {
      alert('No suitable employee found for this task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-gray-300">Assign and track tasks across your team</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
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
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white/5 border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          const assignedEmployee = getAssignedEmployee(task.assignedTo);
          
          return (
            <div
              key={task.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{task.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className={`inline-block px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </div>
                <span className="ml-2 text-xs text-gray-400">• {task.skillRequired}</span>
              </div>

              {assignedEmployee && (
                <div className="flex items-center mb-4 p-3 bg-white/5 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-white">
                      {assignedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{assignedEmployee.name}</p>
                    <p className="text-gray-400 text-xs">{assignedEmployee.skillLevel}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{task.dueDate}</span>
                </div>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1" />
                  <span>{task.skillPointsReward} pts</span>
                </div>
              </div>

              {!task.assignedTo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    autoAssignTask(task);
                  }}
                  className="w-full mt-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Assignment className="w-4 h-4 mr-2" />
                  Auto Assign
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedTask.title}</h2>
                <p className="text-gray-400">{selectedTask.description}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-white font-semibold">Status</span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-white font-semibold">Priority</span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Task Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r ${getDifficultyColor(selectedTask.difficulty)}`}>
                    {selectedTask.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Required Skill:</span>
                  <span className="text-white font-medium">{selectedTask.skillRequired}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white font-medium">{selectedTask.dueDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Skill Points Reward:</span>
                  <span className="text-yellow-400 font-medium">{selectedTask.skillPointsReward} points</span>
                </div>
              </div>
            </div>

            {selectedTask.assignedTo && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Assigned To</h3>
                {(() => {
                  const assignedEmployee = getAssignedEmployee(selectedTask.assignedTo);
                  return assignedEmployee ? (
                    <div className="flex items-center p-4 bg-white/5 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-semibold">
                          {assignedEmployee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{assignedEmployee.name}</p>
                        <p className="text-gray-400 text-sm">{assignedEmployee.email}</p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          assignedEmployee.skillLevel === 'Senior' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {assignedEmployee.skillLevel}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Describe the task..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Difficulty</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;