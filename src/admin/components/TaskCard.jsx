
// client/src/admin/components/TaskCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityTag from './TaskPriorityTag';
import { formatDateToLocal } from '../../utils/dateUtils'; // Assuming you have this

const TaskCard = ({ task, onClick }) => {
  if (!task) return null;

  return (
    <div 
      className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-700 hover:border-yellow-500"
      onClick={() => onClick(task)}
    >
      <h3 className="text-lg font-semibold text-yellow-400 mb-2 truncate" title={task.title}>{task.title}</h3>
      <div className="text-xs text-gray-400 mb-3">
        <p>Client: {task.clientId || 'N/A'}</p>
        <p>Project: {task.projectId || 'N/A'}</p>
      </div>
      <div className="flex justify-between items-center text-sm mb-3">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityTag priority={task.priority} />
      </div>
      <p className="text-xs text-gray-500">Due: {task.dueDate ? formatDateToLocal(task.dueDate) : 'Not set'}</p>
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="mt-2 text-xs">
          <span className="text-gray-400">Assigned: </span>
          <span className="text-gray-300">{task.assignedTo.join(', ')}</span> {/* Improve with user names later */}
        </div>
      )}
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    assignedTo: PropTypes.arrayOf(PropTypes.string),
    clientId: PropTypes.string,
    projectId: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TaskCard;