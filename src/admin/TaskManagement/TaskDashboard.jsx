
// client/src/admin/TaskManagement/TaskDashboard.jsx
import React from 'react';
import { FaTasks, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTasks } from './hooks/useTasks';
import { useTaskStats } from './hooks/useTaskStats';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskPriorityTag from '../components/TaskPriorityTag';
import { Link } from 'react-router-dom';
import { formatDateToLocal } from '../../utils/dateUtils';

const TaskDashboard = () => {
    const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
    const { 
        totalTasks, 
        completedTasks, 
        overdueTasks, 
        completionRate,
        tasksByStatus,
        tasksByPriority 
    } = useTaskStats(tasks);

    const recentTasks = tasks.slice(0, 5); // Get 5 most recent tasks

    if (tasksLoading) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen flex justify-center items-center text-gray-300">
                <FaSpinner className="animate-spin mr-2" /> Loading Task Dashboard...
            </div>
        );
    }

    if (tasksError) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen text-red-400">
                Error loading tasks: {tasksError}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Task Management Dashboard</h1>
                <Link to="/admin/tasks/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow-md transition-colors">
                    Create New Task
                </Link>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard icon={<FaTasks size={24} />} title="Total Tasks" value={totalTasks} color="bg-blue-600" />
                <SummaryCard icon={<FaCheckCircle size={24} />} title="Completed Tasks" value={completedTasks} color="bg-green-600" />
                <SummaryCard icon={<FaExclamationCircle size={24} />} title="Overdue Tasks" value={overdueTasks} color="bg-red-600" />
                <SummaryCard icon={<FaSpinner size={24} />} title="Completion Rate" value={`${completionRate}%`} color="bg-yellow-600" />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ChartCard title="Tasks by Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={tasksByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {tasksByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} itemStyle={{ color: '#e5e7eb' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks by Priority">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksByPriority} layout="vertical" margin={{ right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} itemStyle={{ color: '#e5e7eb' }} />
                            <Legend />
                            <Bar dataKey="value" name="Tasks" barSize={20}>
                                {tasksByPriority.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
            
            {/* Recent Tasks Table */}
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Recent Tasks</h3>
                {recentTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Assigned</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {recentTasks.map(task => (
                                    <tr key={task.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-200 hover:text-yellow-300">
                                            <Link to={`/admin/tasks/${task.id}`}>{task.title}</Link>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm"><TaskStatusBadge status={task.status} /></td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm"><TaskPriorityTag priority={task.priority} /></td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-400">{task.dueDate ? formatDateToLocal(task.dueDate) : 'N/A'}</td>
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-400">{task.assignedTo?.join(', ') || 'Unassigned'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No recent tasks.</p>
                )}
            </div>
        </div>
    );
};

const SummaryCard = ({ icon, title, value, color }) => (
    <div className={`${color} text-white p-5 rounded-xl shadow-lg flex items-center justify-between transition-all hover:scale-105`}>
        <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="opacity-70">
            {icon}
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">{title}</h3>
        {children}
    </div>
);

export default TaskDashboard;