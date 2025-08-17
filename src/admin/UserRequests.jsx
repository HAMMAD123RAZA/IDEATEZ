
// FILE: client/src/admin/UserRequests.jsx

import React, { useEffect, useState, useMemo } from 'react';
import DataTable from './components/DataTable';
import MessageDetailView from './components/MessageDetailView';
import DataTableFilters from './components/DataTableFilters';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { formatDateToLocal, getTimeAgo } from '../utils/dateUtils';
import { useAuth } from './AuthContext';

import { useSorting } from './hooks/useSorting';
import { useSearchFilter } from './hooks/useSearchFilter';
import { useReadStatusFilter } from './hooks/useReadStatusFilter';
import { usePagination } from './hooks/usePagination';
import { FaTrash } from 'react-icons/fa';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md';

function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showReadOnly, setShowReadOnly] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const q = collection(db, 'Get_A_Quote');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updated = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            isRead: data.isRead || false
          };
        });

        const sorted = [...updated].sort((a, b) => b.createdAt - a.createdAt);
        setRequests(sorted);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError("Failed to load messages");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const { sortedData, requestSort, getSortIndicator } = useSorting(requests);
  const filteredBySearch = useSearchFilter(sortedData, filterText);
  const filteredByStatus = useReadStatusFilter(filteredBySearch, showUnreadOnly, showReadOnly);
  const { paginatedData, currentPage, totalPages, setCurrentPage } = usePagination(filteredByStatus, 50);

  const toggleReadStatus = async (id, currentStatus) => {
    if (currentStatus === true && !hasPermission('edit_message_status')) return; // Don't allow marking unread without permission
    if (currentStatus === false && !hasPermission('edit_message_status')) return; // Don't allow marking read without permission (though usually marking read is fine)

    const newStatus = !currentStatus;
    const ref = doc(db, 'Get_A_Quote', id);
    await updateDoc(ref, { isRead: newStatus });
  };

  const confirmDelete = (id) => {
    if (!hasPermission('delete_message')) {
      alert("You don't have permission to delete messages.");
      return;
    }
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId || !hasPermission('delete_message')) return;

    try {
      await deleteDoc(doc(db, 'Get_A_Quote', deleteId));
      setRequests(prev => prev.filter(r => r.id !== deleteId));
      if (selectedRequest && selectedRequest.id === deleteId) {
        setSelectedRequest(null); 
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting message:", err);
      setShowDeleteConfirm(false);
    }
  };

  const handleRowClick = (item) => {
    if (!hasPermission('messages_view_detail')) {
      // If user only has list view permission, do not open detail view.
      return;
    }
    setSelectedRequest(item);
    if (!item.isRead && hasPermission('edit_message_status')) {
      toggleReadStatus(item.id, item.isRead);
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'createdAt',
        label: 'Date',
        sortable: true,
        render: val => (
          <span>{formatDateToLocal(val)} <small className="opacity-70">({getTimeAgo(val)} ago)</small></span>
        )
      },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'isRead',
        label: 'Status',
        render: (val, item) => ( // Pass item to render function
          <div className="text-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click
                  if (hasPermission('edit_message_status')) {
                    toggleReadStatus(item.id, val);
                  }
                }}
                disabled={!hasPermission('edit_message_status')}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs transition-opacity
                            ${val ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            ${!hasPermission('edit_message_status') ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
              {val ? 'Read' : 'Unread'}
              </button>
          </div>
        )
      }
    ];

    if (hasPermission('delete_message')) {
        baseColumns.push({
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, item) => (
              <div className="text-center">
                  <div className="flex justify-center">
                      <button
                          onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(item.id);
                          }}
                          className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                          title="Delete Message"
                      >
                          <FaTrash />
                      </button>
                  </div>
              </div>
            )
        });
    }

    return baseColumns;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission]);

  if (loading && !error) {
    return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-700">Loading messages...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white p-2 rounded ml-4"
          >
            Retry
          </button>
        </div>
    );
  }

  if (selectedRequest) {
    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <MessageDetailView
            message={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            requests={filteredByStatus} 
            setSelectedRequest={setSelectedRequest}
            onToggleRead={(id, status) => { if(hasPermission('edit_message_status')) toggleReadStatus(id, status)}}
            canToggleRead={hasPermission('edit_message_status')}
            canDelete={hasPermission('delete_message')}
            onDeleteRequest={confirmDelete}
          />
        </div>
    );
  }

  return (
      <div className="px-4 py-6">
        <h1 className="text-2xl mx-3 font-bold text-gray-600 uppercase mb-4">User Requests</h1>

        <DataTableFilters
          showUnreadOnly={showUnreadOnly}
          setShowUnreadOnly={setShowUnreadOnly}
          showReadOnly={showReadOnly}
          setShowReadOnly={setShowReadOnly}
          filterText={filterText}
          setFilterText={setFilterText}
        />

        {totalPages > 1 && (
            <div className="mb-4 flex justify-end items-center gap-2 text-sm">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`p-2 rounded-md text-gray-700 ${currentPage === 1 ? 'bg-gray-200 opacity-50 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label="Previous page"
                >
                    <MdSkipPrevious size={20}/>
                </button>
                <span className="px-3 py-1 text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={`p-2 rounded-md text-gray-700 ${currentPage === totalPages ? 'bg-gray-200 opacity-50 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label="Next page"
                >
                   <MdSkipNext size={20} />
                </button>
            </div>
        )}

        <div className="border border-yellow-600 rounded-lg overflow-hidden shadow-xl bg-white">
          <DataTable
            data={paginatedData}
            columns={columns}
            onRowClick={handleRowClick}
            requestSort={requestSort}
            getSortIndicator={getSortIndicator}
          />
        </div>

        <DeleteConfirmModal
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this message?"
        />
      </div>
  );
}

export default UserRequests;