import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  CalendarDays
} from 'lucide-react';
import { mockLeaves, mockEmployees } from '../data/mockData';
import { Leave, Employee } from '../types';

const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>(mockLeaves);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Personal Leave' as Leave['type']
  });

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Leave['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeColor = (type: Leave['type']) => {
    switch (type) {
      case 'Sick Leave':
        return 'from-red-500 to-red-600';
      case 'Personal Leave':
        return 'from-blue-500 to-blue-600';
      case 'Vacation':
        return 'from-emerald-500 to-emerald-600';
      case 'Emergency':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = employees.find(emp => emp.id === newLeave.employeeId);
    if (!employee) return;

    const leave: Leave = {
      id: `leave${leaves.length + 1}`,
      employeeId: newLeave.employeeId,
      employeeName: employee.name,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'Pending',
      type: newLeave.type,
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setLeaves([...leaves, leave]);
    setShowCreateModal(false);
    setNewLeave({
      employeeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      type: 'Personal Leave'
    });
  };

  const handleStatusChange = (leaveId: string, newStatus: Leave['status']) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId ? { ...leave, status: newStatus } : leave
    ));
    setSelectedLeave(null);
  };

  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getUpcomingLeaves = () => {
    const today = new Date();
    return leaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      return startDate >= today && leave.status === 'Approved';
    }).slice(0, 5);
  };

  const getLeaveStats = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getLeaveStats();
  const upcomingLeaves = getUpcomingLeaves();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leave Management</h1>
            <p className="text-gray-300">Manage employee leave requests and approvals</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-500/10 to-cyan-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Total Requests</h3>
            <p className="text-gray-400 text-sm">All time</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Pending</h3>
            <p className="text-gray-400 text-sm">Awaiting approval</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.approved}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Approved</h3>
            <p className="text-gray-400 text-sm">This month</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-pink-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.rejected}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Rejected</h3>
            <p className="text-gray-400 text-sm">This month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search leaves..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white/5 border border-white/20 rounded-xl text-white px-4 py-3 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leave List */}
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedLeave(leave)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {leave.employeeName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{leave.employeeName}</h3>
                      <p className="text-gray-400 text-sm">{leave.startDate} - {leave.endDate}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${getTypeColor(leave.type)}`}>
                      {leave.type}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-gray-300 text-sm">{leave.reason}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    <span>{calculateLeaveDays(leave.startDate, leave.endDate)} days</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Applied: {leave.appliedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Leaves
          </h2>
          <div className="space-y-4">
            {upcomingLeaves.map((leave) => (
              <div key={leave.id} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-white">
                      {leave.employeeName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{leave.employeeName}</p>
                    <p className="text-gray-400 text-xs">{leave.type}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-300">
                  {leave.startDate} - {leave.endDate}
                </div>
              </div>
            ))}
            {upcomingLeaves.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming leaves</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Detail Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Leave Request Details</h2>
                <p className="text-gray-400">{selectedLeave.employeeName}</p>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-teal-400 mr-2" />
                    <span className="text-white font-semibold">Duration</span>
                  </div>
                  <p className="text-gray-300">{selectedLeave.startDate} to {selectedLeave.endDate}</p>
                  <p className="text-sm text-gray-400">{calculateLeaveDays(selectedLeave.startDate, selectedLeave.endDate)} days</p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-teal-400 mr-2" />
                    <span className="text-white font-semibold">Type</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r ${getTypeColor(selectedLeave.type)}`}>
                    {selectedLeave.type}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">Reason</h3>
                <p className="text-gray-300">{selectedLeave.reason}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Status</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedLeave.status)}`}>
                    {selectedLeave.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedLeave.status === 'Pending' && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleStatusChange(selectedLeave.id, 'Rejected')}
                  className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange(selectedLeave.id, 'Approved')}
                  className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
                >
                  Approve
                </button>
              </div>
            )}

            {selectedLeave.status !== 'Pending' && (
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Leave Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Apply for Leave</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Employee</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({...newLeave, employeeId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Leave Type</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value as Leave['type']})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Reason</label>
                <textarea
                  rows={3}
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none"
                  placeholder="Reason for leave..."
                  required
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
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Apply Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;