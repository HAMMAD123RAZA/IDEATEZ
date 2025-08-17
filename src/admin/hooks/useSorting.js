// FILE: client/src/admin/hooks/useSorting.js
import { useState } from 'react';

export const useSorting = (data) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    // Date sorting (handle nulls by pushing them to one end)
    const isADate = valueA instanceof Date;
    const isBDate = valueB instanceof Date;

    if (isADate || isBDate) {
      if (isADate && !isBDate) return sortConfig.direction === 'ascending' ? -1 : 1; // Non-null dates first (asc)
      if (!isADate && isBDate) return sortConfig.direction === 'ascending' ? 1 : -1; // Non-null dates first (asc)
      if (isADate && isBDate) {
        return sortConfig.direction === 'ascending'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      // If one is null and the other is not a Date object, they'll be handled by subsequent checks or default comparison.
      // If both are null, they are considered equal here.
    }


    // String sorting
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortConfig.direction === 'ascending'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle cases where one value is null for non-date comparisons
    if (valueA === null || valueA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1; // nulls/undefined last in ascending
    if (valueB === null || valueB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1; // nulls/undefined last in ascending


    // Default numeric or boolean sort
    // For boolean: true > false
    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return sortConfig.direction === 'ascending' 
            ? (valueA === valueB ? 0 : valueA ? -1 : 1) 
            : (valueA === valueB ? 0 : valueA ? 1 : -1);
    }
    
    // For numbers
    if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'ascending' ? valueA - valueB : valueB - valueA;
    }

    // Fallback for other types if necessary (should ideally be covered)
    return 0;
  });

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ''; // No indicator or a neutral one like '↕'
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return {
    sortedData,
    requestSort,
    getSortIndicator
  };
};
