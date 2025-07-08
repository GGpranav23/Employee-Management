import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, RefreshCw, Download, AlertTriangle, Send as Weekend, BarChart3 } from 'lucide-react';
import { mockEmployees, shiftRequirements } from '../data/mockData';
import { Employee, Shift, ShiftType } from '../types';
import { ShiftAllocator } from '../utils/shiftAllocator';

const ShiftManagement: React.FC = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [currentWeek, setCurrentWeek] = useState(new Date('2024-01-22'));
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const shiftAllocator = useMemo(() => new ShiftAllocator(employees), [employees]);
  
  const weekShifts = useMemo(() => {
    const weekStart = currentWeek.toISOString().split('T')[0];
    return shiftAllocator.allocateShifts(weekStart);
  }, [currentWeek, shiftAllocator]);

  const shiftStats = useMemo(() => 
    shiftAllocator.getShiftStats(weekShifts), 
    [weekShifts, shiftAllocator]
  );

  const weekendDistribution = useMemo(() =>
    shiftAllocator.getWeekendShiftDistribution(),
    [shiftAllocator]
  );

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) { // Changed to 7 days to include weekends
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isWeekendDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getShiftColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case 'Morning':
      case 'WeekendMorning':
        return 'from-orange-500 to-orange-600';
      case 'General':
        return 'from-blue-500 to-blue-600';
      case 'Afternoon':
      case 'WeekendAfternoon':
        return 'from-purple-500 to-purple-600';
      case 'Night':
      case 'WeekendNight':
        return 'from-indigo-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getEmployeeLevel = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.skillLevel : 'Unknown';
  };

  const weekDates = getWeekDates(currentWeek);
  const weekdayShiftTypes: ShiftType[] = ['Morning', 'General', 'Afternoon', 'Night'];
  const weekendShiftTypes: ShiftType[] = ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'];

  const regenerateSchedule = () => {
    alert('Schedule regenerated successfully with weekend coverage!');
  };

  const exportSchedule = () => {
    alert('Full week schedule (including weekends) exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Shift Management</h1>
            <p className="text-gray-300">Manage 7-day schedules with weekend coverage and alternating assignments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={regenerateSchedule}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Regenerate
            </button>
            <button 
              onClick={exportSchedule}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous Week
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              Full Week Schedule
            </h2>
            <p className="text-gray-400">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </p>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Next Week
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{shiftStats.weekdayShifts}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Weekday Shifts</h3>
            <p className="text-gray-400 text-sm">Monday - Friday</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Weekend className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{shiftStats.weekendShifts}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Weekend Shifts</h3>
            <p className="text-gray-400 text-sm">Saturday - Sunday</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{Object.keys(shiftStats.employeeWorkload).length}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Active Employees</h3>
            <p className="text-gray-400 text-sm">This week</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{shiftStats.totalShifts}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Total Shifts</h3>
            <p className="text-gray-400 text-sm">Full week coverage</p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-white font-semibold p-4 border-b border-white/20">Shift Type</th>
                {weekDates.map((date, index) => (
                  <th key={index} className={`text-center text-white font-semibold p-4 border-b border-white/20 min-w-[150px] ${isWeekendDate(date) ? 'bg-purple-500/10' : ''}`}>
                    <div className="flex flex-col items-center">
                      <span>{formatDate(date)}</span>
                      {isWeekendDate(date) && (
                        <span className="text-xs text-purple-400 mt-1">Weekend</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Weekday Shifts */}
              {weekdayShiftTypes.map((shiftType) => (
                <tr key={shiftType}>
                  <td className="p-4 border-b border-white/10">
                    <div className={`inline-block px-3 py-2 text-white font-medium rounded-lg bg-gradient-to-r ${getShiftColor(shiftType)}`}>
                      {shiftType}
                    </div>
                  </td>
                  {weekDates.map((date, dateIndex) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isWeekend = isWeekendDate(date);
                    
                    if (isWeekend) {
                      return (
                        <td key={dateIndex} className="p-4 border-b border-white/10 bg-purple-500/5">
                          <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
                            <span className="text-gray-500 text-sm">Weekend</span>
                          </div>
                        </td>
                      );
                    }
                    
                    const shift = weekShifts.find(s => s.type === shiftType && s.date === dateStr);
                    const requirements = shiftRequirements[shiftType];
                    const isFullyStaffed = shift && shift.employees.length === (requirements.seniors + requirements.juniors);
                    
                    return (
                      <td key={dateIndex} className="p-4 border-b border-white/10">
                        {shift ? (
                          <div 
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              isFullyStaffed 
                                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                            }`}
                            onClick={() => setSelectedShift(shift)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">
                                {shift.employees.length}/{requirements.seniors + requirements.juniors}
                              </span>
                              {!isFullyStaffed && (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div className="space-y-1">
                              {shift.employees.slice(0, 2).map((empId, empIndex) => (
                                <div key={empIndex} className="text-xs text-gray-300 truncate">
                                  {getEmployeeName(empId)}
                                </div>
                              ))}
                              {shift.employees.length > 2 && (
                                <div className="text-xs text-gray-400">
                                  +{shift.employees.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
                            <span className="text-gray-500 text-sm">Not Scheduled</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Weekend Shifts */}
              {weekendShiftTypes.map((shiftType) => (
                <tr key={shiftType} className="bg-purple-500/5">
                  <td className="p-4 border-b border-white/10">
                    <div className={`inline-block px-3 py-2 text-white font-medium rounded-lg bg-gradient-to-r ${getShiftColor(shiftType)} relative`}>
                      {shiftType.replace('Weekend', '')}
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
                    </div>
                  </td>
                  {weekDates.map((date, dateIndex) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isWeekend = isWeekendDate(date);
                    
                    if (!isWeekend) {
                      return (
                        <td key={dateIndex} className="p-4 border-b border-white/10">
                          <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30 text-center">
                            <span className="text-gray-500 text-sm">Weekday</span>
                          </div>
                        </td>
                      );
                    }
                    
                    const shift = weekShifts.find(s => s.type === shiftType && s.date === dateStr);
                    
                    return (
                      <td key={dateIndex} className="p-4 border-b border-white/10 bg-purple-500/5">
                        {shift ? (
                          <div 
                            className="p-3 rounded-lg border cursor-pointer transition-all duration-200 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20"
                            onClick={() => setSelectedShift(shift)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">1/1</span>
                              <Weekend className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="space-y-1">
                              {shift.employees.map((empId, empIndex) => (
                                <div key={empIndex} className="text-xs text-gray-300 truncate">
                                  {getEmployeeName(empId)} ({getEmployeeLevel(empId)})
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                            <span className="text-red-400 text-sm">Unassigned</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekend Distribution Stats */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Weekend className="w-5 h-5 mr-2" />
          Weekend Shift Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(weekendDistribution).slice(0, 6).map(([empId, stats]) => {
            const employee = employees.find(emp => emp.id === empId);
            if (!employee || stats.total === 0) return null;
            
            return (
              <div key={empId} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-semibold text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{employee.name}</p>
                    <p className="text-gray-400 text-xs">{employee.skillLevel}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.total}</p>
                  <p className="text-xs text-gray-400">Weekend shifts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  {selectedShift.type.replace('Weekend', '')} Shift Details
                  {selectedShift.isWeekend && (
                    <Weekend className="w-5 h-5 ml-2 text-purple-400" />
                  )}
                </h2>
                <p className="text-gray-400">{selectedShift.date}</p>
                {selectedShift.isWeekend && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full mt-2">
                    Weekend Shift - Alternating Assignment
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Staff Requirements</span>
                <span className="text-gray-400">
                  {selectedShift.requirements.seniors} Senior, {selectedShift.requirements.juniors} Junior
                  {selectedShift.requirements.alternateWith && (
                    <span className="text-purple-400 text-sm ml-2">
                      (Alternates with {selectedShift.requirements.alternateWith})
                    </span>
                  )}
                </span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-white font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Assigned Staff ({selectedShift.employees.length})
                </h3>
                
                {selectedShift.employees.map((empId) => {
                  const employee = employees.find(emp => emp.id === empId);
                  return employee ? (
                    <div key={empId} className="flex items-center p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{employee.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            employee.skillLevel === 'Senior' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {employee.skillLevel}
                          </span>
                          {selectedShift.isWeekend && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                              Weekend
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedShift(null)}
                className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Edit Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;