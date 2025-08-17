// FILE: client/src/admin/components/DataTableFilters.jsx
import React from 'react';
import PropTypes from 'prop-types';

const DataTableFilters = ({
  showUnreadOnly,
  setShowUnreadOnly,
  showReadOnly,
  setShowReadOnly,
  filterText,
  setFilterText
}) => {
  const handleClearFilters = () => {
    setShowUnreadOnly(false);
    setShowReadOnly(false);
    setFilterText('');
  };

  return (
    <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
      <div className="w-full md:w-auto flex-grow min-w-[200px]">
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full md:w-auto p-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-yellow-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center space-x-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={() => {
              setShowUnreadOnly(!showUnreadOnly);
              if (!showUnreadOnly) setShowReadOnly(false);
            }}
            className="form-checkbox h-4 w-4 text-yellow-500 bg-gray-900 border-gray-600 rounded focus:ring-yellow-500"
          />
          <span className="text-sm">Show Unread Only</span>
        </label>

        <label className="flex items-center space-x-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showReadOnly}
            onChange={() => {
              setShowReadOnly(!showReadOnly);
              if (!showReadOnly) setShowUnreadOnly(false);
            }}
            className="form-checkbox h-4 w-4 text-green-500 bg-gray-900 border-gray-600 rounded focus:ring-green-500"
          />
          <span className="text-sm">Show Read Only</span>
        </label>

        <button
          onClick={handleClearFilters}
          disabled={!showUnreadOnly && !showReadOnly && !filterText}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            showUnreadOnly || showReadOnly || filterText
              ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
              : 'bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

DataTableFilters.propTypes = {
  showUnreadOnly: PropTypes.bool.isRequired,
  setShowUnreadOnly: PropTypes.func.isRequired,
  showReadOnly: PropTypes.bool.isRequired,
  setShowReadOnly: PropTypes.func.isRequired,
  filterText: PropTypes.string.isRequired,
  setFilterText: PropTypes.func.isRequired
};

export default DataTableFilters;