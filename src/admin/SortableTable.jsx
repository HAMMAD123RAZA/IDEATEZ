// client/src/admin/SortableTable.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { FaRegCircle, FaCheckCircle } from 'react-icons/fa';
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { formatDateToLocal } from '../utils/dateUtils';

const SortableTable = ({ data, columns, onRowClick, onCheckboxChange }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterText, setFilterText] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [tableData, setTableData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Sync incoming `data` prop to state (fallback)
  useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

// Rely on props.data being passed from parent component
useEffect(() => {
  if (data && data.length > 0) {
    setTableData(data);
  }
}, [data]);

  // Apply filters and sorting
  const filteredData = useMemo(() => {
    let result = [...tableData];

    // unread / read filter
    if (showUnreadOnly) {
      result = result.filter(item => !item.isRead);
    } else if (showReadOnly) {
      result = result.filter(item => item.isRead);
    }

    // Apply search filter
    if (filterText) {
      const filterLower = filterText.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(filterLower)
        )
      );
    }

    // Apply Sorting
    if (!sortConfig.key) return result;

    return result.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];

      if (valueA instanceof Date && valueB instanceof Date) {
        return sortConfig.direction === 'ascending'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'ascending'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortConfig.direction === 'ascending' ? valueA - valueB : valueB - valueA;
    });
  }, [tableData, sortConfig, showUnreadOnly, showReadOnly, filterText]);

  // Pagination logic comes AFTER filteredData is defined
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredData, currentPage, rowsPerPage]);

  // Mark Row as Read
  const markAsRead = async (id) => {
    try {
      const docRef = doc(db, 'Get_A_Quote', id);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Sorting Functions
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Checkboxes & Selection
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
    onCheckboxChange?.(selectedRows);
  };

  // Drag & Drop Support
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e, targetId) => {
    console.log('Dropped:', e.dataTransfer.getData('text/plain'), 'on', targetId);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:border-yellow-500 w-full sm:w-64"
        />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
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
          </div>

          <button
            onClick={() => {
              setShowUnreadOnly(false);
              setShowReadOnly(false);
              setFilterText('');
            }}
            className={`text-xs px-2 py-1 rounded ${showUnreadOnly || showReadOnly || filterText
                ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            disabled={!showUnreadOnly && !showReadOnly && !filterText}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-2 py-1 text-sm">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          &lt; Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          Next &gt;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-500 text-yellow-300 rounded-lg overflow-hidden shadow-md">
<thead className="bg-gray-600 border-b border-yellow-600 text-left">
  <th className="p-2"></th>
  <th className="p-2"></th>
  {columns.map(col => (
    <th
      key={col.key}
      onClick={() => col.sortable !== false && requestSort(col.key)}
      className="py-2 px-4 font-semibold cursor-pointer hover:bg-gray-700 transition-colors group"
    >
      <div className="flex items-center">
        {col.label || '—'}
        {col.sortable !== false && (
          <span className="ml-1 text-yellow-400 opacity-0 group-hover:opacity-100">
            {sortConfig.key === col.key 
              ? (sortConfig.direction === 'ascending' ? '▲' : '▼')
              : '▲'}
          </span>
        )}
      </div>
    </th>
  ))}
</thead>
          <tbody className="divide-y divide-yellow-600 bg-gray-900 text-gray-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-4">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`group hover:bg-gray-700 transition-colors duration-150 cursor-pointer ${item.isRead ? 'text-gray-300' : 'text-yellow-500'
                    }`}
                  onClick={() => {
                    if (!item.isRead) {
                      markAsRead(item.id);
                    }
                    onRowClick?.(item);
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.id)}
                >
                  {/* Drag Handle */}
                  <td className="p-1 text-center text-gray-500 group-hover:text-yellow-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8l2 2m0 0l2 2m-4-4h16m-2-2v12m-2-12v12m-2-12v12m-2-12v12m-2-12v12m-2-12v12m-2-12v12" />
                    </svg>
                  </td>

                  {/* Checkbox */}
                  <td className="p-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent row click
                        toggleSelectRow(item.id);
                      }}
                      className="form-checkbox h-4 w-4 text-yellow-500 rounded focus:ring-0"
                    />
                  </td>

                  {/* Data Cells */}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-1 px-4 group-hover:text-yellow-200 transition-colors"
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : (item[col.key] ?? '—')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-2 py-1 text-sm">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          &lt; Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default SortableTable;