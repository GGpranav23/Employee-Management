import { Employee, Task, ShiftType } from '../types';

export class TaskAssigner {
  private employees: Employee[];
  
  constructor(employees: Employee[]) {
    this.employees = employees;
  }

  assignTask(task: Task): string | null {
    // Find employees with the required skill
    const skillMatchEmployees = this.employees.filter(emp => 
      emp.skills.includes(task.skillRequired)
    );

    if (skillMatchEmployees.length === 0) {
      return null; // No one has the required skill
    }

    // Score employees based on various factors
    const scoredEmployees = skillMatchEmployees.map(emp => ({
      employee: emp,
      score: this.calculateAssignmentScore(emp, task),
    }));

    // Sort by score (highest first)
    scoredEmployees.sort((a, b) => b.score - a.score);

    return scoredEmployees[0].employee.id;
  }

  private calculateAssignmentScore(employee: Employee, task: Task): number {
    let score = 0;

    // Skill level matching
    if (task.difficulty === 'Hard' && employee.skillLevel === 'Senior') {
      score += 30;
    } else if (task.difficulty === 'Medium' && employee.skillLevel === 'Senior') {
      score += 25;
    } else if (task.difficulty === 'Easy') {
      score += 20;
    }

    // Workload balance (prefer employees with fewer current tasks)
    const currentTaskCount = this.getCurrentTaskCount(employee.id);
    score += Math.max(0, 10 - currentTaskCount * 2);

    // Skill development opportunity (give juniors easier tasks for growth)
    if (employee.skillLevel === 'Junior' && task.difficulty !== 'Hard') {
      score += 15;
    }

    // Random factor for fairness
    score += Math.random() * 5;

    return score;
  }

  private getCurrentTaskCount(employeeId: string): number {
    // This would typically query the database for active tasks
    // For now, we'll use a simple estimate based on tasks completed
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? Math.floor(employee.tasksCompleted / 10) : 0;
  }

  getTaskRecommendations(employeeId: string, availableTasks: Task[]): Task[] {
    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) return [];

    return availableTasks
      .filter(task => employee.skills.includes(task.skillRequired))
      .sort((a, b) => {
        const scoreA = this.calculateAssignmentScore(employee, a);
        const scoreB = this.calculateAssignmentScore(employee, b);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  distributeTasksEqually(tasks: Task[]): Map<string, Task[]> {
    const distribution = new Map<string, Task[]>();
    
    // Initialize distribution map
    this.employees.forEach(emp => {
      distribution.set(emp.id, []);
    });

    // Sort tasks by priority and difficulty
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      const difficultyWeight = { Hard: 3, Medium: 2, Easy: 1 };
      
      const scoreA = priorityWeight[a.priority] + difficultyWeight[a.difficulty];
      const scoreB = priorityWeight[b.priority] + difficultyWeight[b.difficulty];
      
      return scoreB - scoreA;
    });

    // Assign tasks
    for (const task of sortedTasks) {
      const assignedEmployeeId = this.assignTask(task);
      if (assignedEmployeeId) {
        const employeeTasks = distribution.get(assignedEmployeeId) || [];
        employeeTasks.push(task);
        distribution.set(assignedEmployeeId, employeeTasks);
      }
    }

    return distribution;
  }
}