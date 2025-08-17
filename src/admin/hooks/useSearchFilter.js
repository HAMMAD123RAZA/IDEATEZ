
// For Text Search

// FILE: client/src/admin/hooks/useSearchFilter.js
import { useMemo } from 'react';

export const useSearchFilter = (data, filterText, filterType = '') => { // Added filterType, default to empty
  return useMemo(() => {
    if (!filterText.trim()) return data;

    const lowerFilterText = filterText.toLowerCase();
    
    return data.filter(item => {
      if (filterType && item.hasOwnProperty(filterType)) {
        // Filter by specific field if filterType is provided and valid
        return String(item[filterType]).toLowerCase().includes(lowerFilterText);
      } else {
        // Fallback to searching all fields if filterType is not provided or not a valid key
        return Object.values(item).some(val =>
          String(val).toLowerCase().includes(lowerFilterText)
        );
      }
    });
  }, [data, filterText, filterType]);
};
