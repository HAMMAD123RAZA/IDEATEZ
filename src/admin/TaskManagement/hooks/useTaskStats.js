
// client/src/admin/TaskManagement/hooks/useTaskStats.js
import { useMemo } from 'react';

export const useTaskStats = (tasks) => {
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        canceledTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        tasksByStatus: [], // For pie chart: { name: 'Completed', value: 10 }
        tasksByPriority: [], // { name: 'High', value: 5 }
      };
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;
    const canceledTasks = tasks.filter(task => task.status === 'canceled').length;
    
    const today = new Date();
    today.setHours(0,0,0,0); // Compare dates only
    const overdueTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed' && task.status !== 'canceled'
    ).length;
        
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const tasksByStatus = [
        { name: 'Not Started', value: notStartedTasks, fill: '#9ca3af' }, // Gray
        { name: 'In Progress', value: inProgressTasks, fill: '#3b82f6' }, // Blue
        { name: 'Completed', value: completedTasks, fill: '#10b981' },   // Green
        { name: 'Canceled', value: canceledTasks, fill: '#ef4444' },    // Red
      ];

    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

    const tasksByPriority = [
        { name: 'High', value: highPriorityTasks, fill: '#ef4444'}, // Red
        { name: 'Medium', value: mediumPriorityTasks, fill: '#f59e0b'}, // Amber
        { name: 'Low', value: lowPriorityTasks, fill: '#3b82f6'} // Blue
    ];


    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      canceledTasks,
      overdueTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority
    };
  }, [tasks]);

  return stats;
};