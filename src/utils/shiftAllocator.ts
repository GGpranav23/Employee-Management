import { Employee, Shift, ShiftType, WeekendShiftRecord } from '../types';
import { shiftRequirements } from '../data/mockData';

export class ShiftAllocator {
  private employees: Employee[];
  private weekendShiftCounter: Map<string, number> = new Map(); // Track weekend shift counts
  
  constructor(employees: Employee[]) {
    this.employees = employees;
    this.initializeWeekendShiftCounter();
  }

  private initializeWeekendShiftCounter() {
    this.employees.forEach(emp => {
      this.weekendShiftCounter.set(emp.id, emp.weekendShiftHistory?.length || 0);
    });
  }

  allocateShifts(weekStart: string): Shift[] {
    const shifts: Shift[] = [];
    const weekDates = this.getFullWeekDates(weekStart); // Now includes weekends
    
    for (const date of weekDates) {
      const isWeekend = this.isWeekendDate(date);
      const dailyShifts = isWeekend 
        ? this.allocateWeekendShifts(date)
        : this.allocateWeekdayShifts(date);
      shifts.push(...dailyShifts);
    }
    
    return shifts;
  }

  private getFullWeekDates(weekStart: string): string[] {
    const dates: string[] = [];
    const startDate = new Date(weekStart);
    
    // Get full week including weekends (7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  private isWeekendDate(date: string): boolean {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  private allocateWeekdayShifts(date: string): Shift[] {
    const shifts: Shift[] = [];
    const availableEmployees = this.getAvailableEmployees([date]);
    const usedEmployees = new Set<string>();
    
    const weekdayShiftTypes: ShiftType[] = ['Morning', 'General', 'Afternoon', 'Night'];
    
    for (const shiftType of weekdayShiftTypes) {
      const requirements = shiftRequirements[shiftType];
      const assignedEmployees = this.assignEmployeesToShift(
        availableEmployees,
        requirements,
        usedEmployees
      );
      
      if (assignedEmployees.length > 0) {
        shifts.push({
          id: `${date}-${shiftType}`,
          type: shiftType,
          date,
          employees: assignedEmployees,
          requirements,
          isWeekend: false,
        });
        
        assignedEmployees.forEach(id => usedEmployees.add(id));
      }
    }
    
    return shifts;
  }

  private allocateWeekendShifts(date: string): Shift[] {
    const shifts: Shift[] = [];
    const availableEmployees = this.getWeekendAvailableEmployees(date);
    
    const weekendShiftTypes: ShiftType[] = ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'];
    
    for (const shiftType of weekendShiftTypes) {
      const requirements = shiftRequirements[shiftType];
      const assignedEmployee = this.assignWeekendEmployee(
        availableEmployees,
        requirements,
        date,
        shiftType
      );
      
      if (assignedEmployee) {
        shifts.push({
          id: `${date}-${shiftType}`,
          type: shiftType,
          date,
          employees: [assignedEmployee],
          requirements,
          isWeekend: true,
        });
        
        // Update weekend shift history
        this.updateWeekendShiftHistory(assignedEmployee, date, shiftType);
      }
    }
    
    return shifts;
  }

  private getWeekendAvailableEmployees(date: string): Employee[] {
    return this.employees.filter(employee => {
      const [weekendDay1, weekendDay2] = employee.weekendsOff;
      // Employee is available if this weekend is not their scheduled off days
      return date !== weekendDay1 && date !== weekendDay2;
    });
  }

  private assignWeekendEmployee(
    availableEmployees: Employee[],
    requirements: { seniors: number; juniors: number; alternateWith?: 'senior' | 'junior' },
    date: string,
    shiftType: ShiftType
  ): string | null {
    // Determine if we need a senior or junior based on alternating pattern
    const needsSenior = requirements.seniors > 0;
    const needsJunior = requirements.juniors > 0;
    
    // Get the appropriate level employees
    let candidateEmployees: Employee[];
    if (needsSenior) {
      candidateEmployees = availableEmployees.filter(emp => emp.skillLevel === 'Senior');
    } else if (needsJunior) {
      candidateEmployees = availableEmployees.filter(emp => emp.skillLevel === 'Junior');
    } else {
      // Alternating pattern - check last assignment for this shift type
      const shouldAssignSenior = this.shouldAssignSeniorForAlternating(shiftType, date);
      candidateEmployees = availableEmployees.filter(emp => 
        emp.skillLevel === (shouldAssignSenior ? 'Senior' : 'Junior')
      );
    }
    
    if (candidateEmployees.length === 0) {
      return null;
    }
    
    // Sort by weekend shift count (ascending) to ensure fair distribution
    candidateEmployees.sort((a, b) => {
      const countA = this.weekendShiftCounter.get(a.id) || 0;
      const countB = this.weekendShiftCounter.get(b.id) || 0;
      return countA - countB;
    });
    
    return candidateEmployees[0].id;
  }

  private shouldAssignSeniorForAlternating(shiftType: ShiftType, date: string): boolean {
    // Simple alternating logic based on week number and shift type
    const weekNumber = Math.floor(new Date(date).getTime() / (7 * 24 * 60 * 60 * 1000));
    const shiftTypeIndex = ['WeekendMorning', 'WeekendAfternoon', 'WeekendNight'].indexOf(shiftType);
    
    // Alternate based on week number and shift type
    return (weekNumber + shiftTypeIndex) % 2 === 0;
  }

  private updateWeekendShiftHistory(employeeId: string, date: string, shiftType: ShiftType) {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (employee) {
      if (!employee.weekendShiftHistory) {
        employee.weekendShiftHistory = [];
      }
      
      employee.weekendShiftHistory.push({
        date,
        shiftType,
        employeeLevel: employee.skillLevel,
      });
      
      // Update counter
      const currentCount = this.weekendShiftCounter.get(employeeId) || 0;
      this.weekendShiftCounter.set(employeeId, currentCount + 1);
    }
  }

  private getAvailableEmployees(weekDates: string[]): Employee[] {
    return this.employees.filter(employee => {
      const [weekendDay1, weekendDay2] = employee.weekendsOff;
      return !weekDates.some(date => date === weekendDay1 || date === weekendDay2);
    });
  }

  private assignEmployeesToShift(
    availableEmployees: Employee[],
    requirements: { seniors: number; juniors: number },
    usedEmployees: Set<string>
  ): string[] {
    const assigned: string[] = [];
    
    // Get available employees for this shift
    const unused = availableEmployees.filter(emp => !usedEmployees.has(emp.id));
    
    // Assign seniors
    const availableSeniors = unused.filter(emp => emp.skillLevel === 'Senior');
    for (let i = 0; i < requirements.seniors && i < availableSeniors.length; i++) {
      assigned.push(availableSeniors[i].id);
    }
    
    // Assign juniors
    const availableJuniors = unused.filter(emp => emp.skillLevel === 'Junior');
    for (let i = 0; i < requirements.juniors && i < availableJuniors.length; i++) {
      assigned.push(availableJuniors[i].id);
    }
    
    return assigned;
  }

  getShiftStats(shifts: Shift[]): {
    totalShifts: number;
    weekdayShifts: number;
    weekendShifts: number;
    employeeWorkload: Record<string, number>;
    weekendWorkload: Record<string, number>;
    shiftCoverage: Record<ShiftType, number>;
  } {
    const stats = {
      totalShifts: shifts.length,
      weekdayShifts: shifts.filter(s => !s.isWeekend).length,
      weekendShifts: shifts.filter(s => s.isWeekend).length,
      employeeWorkload: {} as Record<string, number>,
      weekendWorkload: {} as Record<string, number>,
      shiftCoverage: {} as Record<ShiftType, number>,
    };

    shifts.forEach(shift => {
      // Count employee workload
      shift.employees.forEach(empId => {
        stats.employeeWorkload[empId] = (stats.employeeWorkload[empId] || 0) + 1;
        
        // Track weekend workload separately
        if (shift.isWeekend) {
          stats.weekendWorkload[empId] = (stats.weekendWorkload[empId] || 0) + 1;
        }
      });

      // Count shift coverage
      stats.shiftCoverage[shift.type] = (stats.shiftCoverage[shift.type] || 0) + 1;
    });

    return stats;
  }

  getWeekendShiftDistribution(): Record<string, { total: number; senior: number; junior: number }> {
    const distribution: Record<string, { total: number; senior: number; junior: number }> = {};
    
    this.employees.forEach(emp => {
      const history = emp.weekendShiftHistory || [];
      distribution[emp.id] = {
        total: history.length,
        senior: history.filter(h => h.employeeLevel === 'Senior').length,
        junior: history.filter(h => h.employeeLevel === 'Junior').length,
      };
    });
    
    return distribution;
  }
}