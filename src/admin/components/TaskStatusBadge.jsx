
// client/src/admin/components/TaskStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const TaskStatusBadge = ({ status }) => {
  let bgColorClass = 'bg-gray-500';
  let textColorClass = 'text-gray-100';

  switch (status?.toLowerCase()) {
    case 'not-started':
      bgColorClass = 'bg-gray-600';
      textColorClass = 'text-gray-200';
      break;
    case 'in-progress':
      bgColorClass = 'bg-blue-600';
      textColorClass = 'text-blue-100';
      break;
    case 'completed':
      bgColorClass = 'bg-green-600';
      textColorClass = 'text-green-100';
      break;
    case 'canceled':
      bgColorClass = 'bg-red-600';
      textColorClass = 'text-red-100';
      break;
    default:
      // Keep default gray for unknown statuses
      break;
  }

  return (
    <span 
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${bgColorClass} ${textColorClass}`}
    >
      {status ? status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
    </span>
  );
};

TaskStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default TaskStatusBadge;