
// client/src/admin/components/TaskFilter.jsx
import React from 'react';
import PropTypes from 'prop-types';

// This component can be expanded later to integrate with DataTableFilters or provide more specific task filters
// For now, it's a placeholder that might not be directly used if DataTableFilters covers the needs.

const TaskFilter = ({ onFilterChange }) => {
  // Placeholder content - In a real scenario, this would have inputs for various filters
  // like status, client, assigned user, due date range, priority.
  // It would call onFilterChange with an object of active filters.

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-4">
      <h4 className="text-md font-semibold text-yellow-400 mb-3">Task Filters (Placeholder)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm text-gray-300 mb-1">Status</label>
          <select id="status-filter" className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500" disabled>
            <option>All</option>
            {/* Populate with actual statuses */}
          </select>
        </div>
        <div>
          <label htmlFor="priority-filter" className="block text-sm text-gray-300 mb-1">Priority</label>
          <select id="priority-filter" className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500" disabled>
            <option>All</option>
             {/* Populate with actual priorities */}
          </select>
        </div>
        <div>
          <label htmlFor="due-date-filter" className="block text-sm text-gray-300 mb-1">Due Date</label>
          <input type="date" id="due-date-filter" className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500" disabled />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">More advanced filtering options will be available here.</p>
    </div>
  );
};

TaskFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default TaskFilter;