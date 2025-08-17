
// For Pagination support

// FILE: client/src/admin/hooks/usePagination.js
import { useState, useMemo } from 'react';

export const usePagination = (data, initialRowsPerPage = 10) => { // Default to 10
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage); 

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  return {
    paginatedData,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
