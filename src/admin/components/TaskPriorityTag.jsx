
// client/src/admin/components/TaskPriorityTag.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const TaskPriorityTag = ({ priority }) => {
  let icon;
  let colorClass = 'text-gray-300 border-gray-500'; // Default
  let text = 'Medium';

  switch (priority?.toLowerCase()) {
    case 'high':
      icon = <FaArrowUp className="mr-1" />;
      colorClass = 'text-red-400 border-red-500';
      text = 'High';
      break;
    case 'medium':
      icon = <FaEquals className="mr-1" />;
      colorClass = 'text-yellow-400 border-yellow-500';
      text = 'Medium';
      break;
    case 'low':
      icon = <FaArrowDown className="mr-1" />;
      colorClass = 'text-blue-400 border-blue-500';
      text = 'Low';
      break;
    default:
      icon = <FaEquals className="mr-1" />; // Default for unknown
      text = priority || 'Medium'; // Show passed priority or default to Medium
      break;
  }

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${colorClass}`}
    >
      {icon}
      {text}
    </span>
  );
};

TaskPriorityTag.propTypes = {
  priority: PropTypes.string,
};

export default TaskPriorityTag;