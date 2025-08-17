
// FILE: client/src/admin/Applicants.jsx

import React, { useEffect, useState, useMemo } from 'react';
import DataTable from './components/DataTable';
import ApplicantDetailView from './components/ApplicantDetailView';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { FaTrash } from 'react-icons/fa';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { useAuth } from './AuthContext';

import { useSorting } from './hooks/useSorting';
import { useSearchFilter } from './hooks/useSearchFilter';
import { usePagination } from './hooks/usePagination';
import { useReadStatusFilter } from './hooks/useReadStatusFilter';
import { formatDateToLocal, getTimeAgo } from '../utils/dateUtils';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md'; // Using MdSkipNext for consistency


const Applicants = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [filterType, setFilterType] = useState(''); 
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [showReadOnly, setShowReadOnly] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteApplicantId, setDeleteApplicantId] = useState(null);
    const { hasPermission } = useAuth();

    const processApplicantData = (docSnapshotOrPlainObject) => {
        const id = docSnapshotOrPlainObject.id;
        const appData = docSnapshotOrPlainObject.data ? docSnapshotOrPlainObject.data() : { ...docSnapshotOrPlainObject };
        if (!docSnapshotOrPlainObject.data) {
            delete appData.id;
        }

        let shortlisted = false;
        if (typeof appData.shortlisted === 'boolean') {
            shortlisted = appData.shortlisted;
        } else if (appData.shortlisted === 'Yes') { 
            shortlisted = true;
        }

        let rejected = false;
        if (typeof appData.rejected === 'boolean') {
            rejected = appData.rejected;
        } else if (appData.rejected === 'Yes') { 
            rejected = true;
        }

        let submittedAtDate = null; 
        if (appData.submittedAt instanceof Timestamp) {
            submittedAtDate = appData.submittedAt.toDate();
        } else if (appData.submittedAt instanceof Date) {
            submittedAtDate = appData.submittedAt; 
        } else if (appData.submittedAt != null) { 
            const parsedDate = new Date(appData.submittedAt);
            if (!isNaN(parsedDate.getTime())) {
                submittedAtDate = parsedDate;
            }
        }

        return {
            id: id,
            ...appData,
            name: appData.name || 'N/A',
            email: appData.email || 'N/A',
            position: appData.position || 'N/A',
            shortlisted,
            rejected,
            shortlistedDate: appData.shortlistedDate || null,
            rejectedDate: appData.rejectedDate || null,
            isRead: typeof appData.isRead === 'boolean' ? appData.isRead : false,
            resumeStatus: appData.resumeStatus || 'Pending Review',
            submittedAt: submittedAtDate, 
            statusHistory: appData.statusHistory || [],
        };
    };


    useEffect(() => {
        setLoading(true);
        const q = collection(db, 'applications');
        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const docsToProcessPromises = snapshot.docs.map(async (docSnap) => {
                    const appData = docSnap.data();
                    const updates = {};
                    let dataForProcessing = { ...appData };

                    if (appData.resumeStatus === undefined) updates.resumeStatus = 'Pending Review';
                    if (appData.statusHistory === undefined) updates.statusHistory = [];
                    if (appData.isRead === undefined) updates.isRead = false;
                    if (appData.shortlisted === undefined) updates.shortlisted = false;
                    if (appData.rejected === undefined) updates.rejected = false;
                    if (appData.shortlistedDate === undefined) updates.shortlistedDate = null;
                    if (appData.rejectedDate === undefined) updates.rejectedDate = null;


                    if (Object.keys(updates).length > 0) {
                        try {
                            await updateDoc(doc(db, 'applications', docSnap.id), updates);
                            dataForProcessing = { ...appData, ...updates };
                        } catch (err) {
                            console.error(`Error updating doc ${docSnap.id} with defaults:`, err);
                        }
                    }
                    return processApplicantData({ id: docSnap.id, ...dataForProcessing });
                });

                try {
                    const processedDocs = await Promise.all(docsToProcessPromises);
                    const sorted = [...processedDocs].sort((a, b) => {
                        const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(0); 
                        const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(0); 
                        return dateB.getTime() - dateA.getTime();
                    });
                    setData(sorted);
                } catch (err) {
                    console.error('Error processing documents with defaults:', err);
                    setError("Failed to load applicants after processing defaults");
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error('Error fetching applicants:', err);
                setError("Failed to load applicants");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedApplicant && data.length > 0) {
            const updatedApplicantFromList = data.find(app => app.id === selectedApplicant.id);
            if (updatedApplicantFromList) {
                if (
                    selectedApplicant.resumeStatus !== updatedApplicantFromList.resumeStatus ||
                    selectedApplicant.isRead !== updatedApplicantFromList.isRead ||
                    selectedApplicant.shortlisted !== updatedApplicantFromList.shortlisted ||
                    selectedApplicant.rejected !== updatedApplicantFromList.rejected ||
                    selectedApplicant.shortlistedDate !== updatedApplicantFromList.shortlistedDate ||
                    selectedApplicant.rejectedDate !== updatedApplicantFromList.rejectedDate ||
                    (selectedApplicant.statusHistory?.length !== updatedApplicantFromList.statusHistory?.length)
                ) {
                    setSelectedApplicant(updatedApplicantFromList);
                }
            } else {
                setSelectedApplicant(null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selectedApplicant?.id]);


    const { sortedData, requestSort, getSortIndicator } = useSorting(data);
    const filteredBySearch = useSearchFilter(sortedData, filterText, filterType);
    const filteredByStatus = useReadStatusFilter(filteredBySearch, showUnreadOnly, showReadOnly);
    const { paginatedData, currentPage, totalPages, setCurrentPage } = usePagination(filteredByStatus, 50);


    const openApplicantDetailView = (applicant) => {
        if (!hasPermission('view_applicant_details')) {
            // If user can only view the list, do not open detail view.
            return;
        }
        setSelectedApplicant(applicant);
        if (!applicant.isRead && hasPermission('edit_applicant_status')) { // Also check permission to mark as read
            const ref = doc(db, 'applications', applicant.id);
            updateDoc(ref, { isRead: true }).catch(err => console.error("Error marking as read:", err));
        }
    };

    const closeApplicantDetailView = () => {
        setSelectedApplicant(null);
    };

    const confirmDeleteApplicant = (id) => {
        if (!hasPermission('delete_applicant')) {
            alert("You don't have permission to delete applicants.");
            return;
        }
        setDeleteApplicantId(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteApplicant = async () => {
        if (!deleteApplicantId || !hasPermission('delete_applicant')) return;
        try {
            await deleteDoc(doc(db, 'applications', deleteApplicantId));
            if (selectedApplicant && selectedApplicant.id === deleteApplicantId) {
                setSelectedApplicant(null);
            }
            setShowDeleteConfirm(false);
            setDeleteApplicantId(null);
        } catch (error) {
            console.error('Error deleting applicant:', error);
            setShowDeleteConfirm(false);
        }
    };


    const columns = useMemo(() => [
        {
            key: 'submittedAt',
            label: 'Submitted',
            sortable: true,
            render: val => ( 
                <div className="text-xs">
                    <div>{val ? formatDateToLocal(val).split(',')[0] : 'N/A'}</div>
                    <div className="opacity-70">{val ? formatDateToLocal(val).split(',')[1] : ''}</div>
                    <div className="text-xxs opacity-60">{val ? getTimeAgo(val) : ''}</div>
                </div>
            )
        },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'position', label: 'Position', sortable: true },
        {
            key: 'isRead',
            label: 'Status',
            sortable: true,
            render: (val) => (
                <div className="text-center">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${val
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                    >
                        {val ? 'Read' : 'Unread'}
                    </span>
                </div>
            )
        },
        {
            key: 'resumeStatus',
            label: 'Stage',
            sortable: true,
            render: (val) => {
                let bgColor = 'bg-gray-200 text-gray-700';
                if (val === 'Shortlisted' || val === 'Offer Extended' || val === 'Hired') bgColor = 'bg-green-200 text-green-800';
                else if (val && val.startsWith('Rejected')) bgColor = 'bg-red-200 text-red-800';
                else if (val === 'Viewed' || val === 'Initial Screening' || val === 'Interview Scheduled' || val === 'Technical Assessment') bgColor = 'bg-blue-200 text-blue-800';
                else if (val === 'Pending Review') bgColor = 'bg-yellow-200 text-yellow-800';

                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
                            {val || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, item) => (
                <div className="text-center">
                    <div className="flex justify-center space-x-2 opacity-80 group-hover:opacity-100">
                        {hasPermission('delete_applicant') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteApplicant(item.id);
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete Applicant"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>
            )
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [hasPermission]);


    if (loading && !error) {
        return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg">Loading applicants...</p>
                </div>
        );
    }

    if (error) {
        return (
                <div className="flex justify-center items-center h-64">
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

    if (selectedApplicant) {
        return (
                <ApplicantDetailView
                    applicant={selectedApplicant}
                    onClose={closeApplicantDetailView}
                    applicants={filteredByStatus} 
                    setSelectedApplicant={setSelectedApplicant}
                />
        );
    }


    return (
        <> 
            <div className="px-4 py-6">
                <h1 className="text-2xl mx-3 font-bold text-gray-600 uppercase mb-4">Applicants</h1>

                <div className="p-4 rounded-lg mb-6 bg-gray-800">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-white mb-1">Filter By Field</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                                aria-label="Filter by field"
                            >
                                <option value="">All Fields</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="position">Position</option>
                                <option value="resumeStatus">Stage</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-white mb-1">Search</label>
                            <input
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder={`Search ${filterType ? filterType : 'all fields'}...`}
                                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                                aria-label="Search applicants"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showUnreadOnly}
                                onChange={() => {
                                    setShowUnreadOnly(!showUnreadOnly);
                                    if (showReadOnly && !showUnreadOnly) setShowReadOnly(false);
                                }}
                                className="form-checkbox h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                                aria-label="Show unread only"
                            />
                            <span className="ml-2 text-sm text-white">Show Unread Only</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showReadOnly}
                                onChange={() => {
                                    setShowReadOnly(!showReadOnly);
                                    if (showUnreadOnly && !showReadOnly) setShowUnreadOnly(false);
                                }}
                                className="form-checkbox h-4 w-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                                aria-label="Show read only"
                            />
                            <span className="ml-2 text-sm text-white">Show Read Only</span>
                        </label>
                    </div>
                </div>
                
                {/* Pagination Controls - Top Right */}
                {totalPages > 1 && (
                    <div className="mb-4 flex justify-end items-center gap-2 text-sm">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={`p-2 rounded-md text-white ${currentPage === 1 ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                            aria-label="Previous page"
                        >
                            <MdSkipPrevious size={20}/>
                        </button>
                        <span className="px-3 py-1 text-gray-300">Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={`p-2 rounded-md text-white ${currentPage === totalPages ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
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
                        onRowClick={(item) => openApplicantDetailView(item)}
                        requestSort={requestSort}
                        getSortIndicator={getSortIndicator}
                    />
                </div>

            </div>
            <DeleteConfirmModal
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteApplicant}
                title="Confirm Applicant Deletion"
                message="Are you sure you want to delete this applicant? This action cannot be undone."
            />
        </>
    );
};

export default Applicants;