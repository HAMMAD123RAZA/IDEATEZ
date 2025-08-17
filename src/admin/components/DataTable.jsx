import React from 'react';
import PropTypes from 'prop-types';

const DataTable = ({ data, columns, onRowClick, requestSort, getSortIndicator }) => {
  return (
    <div className="overflow-x-auto md:overflow-x-visible"> {/* Added container div */}
      <table className="min-w-full bg-gray-500 text-yellow-300 rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-600 border-b border-yellow-600 text-left">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && requestSort?.(col.key)}
                className="py-2 px-4 font-semibold cursor-pointer hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center">
                  {col.label || '—'}
                  {col.sortable !== false && (
                    <span className="ml-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {getSortIndicator(col.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-yellow-600 bg-gray-900 text-gray-300">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">No records found</td>
            </tr>
          ) : (
            data.map(item => (
              <tr
                key={item.id}
                className="group hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                onClick={() => onRowClick?.(item)}
              >
                {columns.map(col => {
                  const value = item[col.key];
                  return (
                    <td
                      key={`${item.id}-${col.key}`}
                      className="py-3 px-4 border-b group-hover:text-yellow-200 transition-colors"
                    >
                      {col.render ? col.render(value, item) : value ?? '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func
    })
  ).isRequired,
  onRowClick: PropTypes.func,
  requestSort: PropTypes.func,
  getSortIndicator: PropTypes.func
};

export default DataTable;