// FILE: client/src/admin/components/ApplicantDetailView.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../../utils/firebase';
import { doc, updateDoc, arrayUnion, deleteDoc, Timestamp } from 'firebase/firestore';
import { FaArrowLeft, FaDownload, FaExternalLinkAlt, FaTrash, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatDateToLocal, getTimeAgo } from '../../utils/dateUtils';
import DeleteConfirmModal from './DeleteConfirmModal';

const resumeStatusOptions = [
  "Pending Review", "Viewed", "Initial Screening", "Interview Scheduled",
  "Technical Assessment", "Offer Extended", "Hired",
  "Rejected - Not a Fit", "Rejected - Position Filled", "Rejected - Other",
  "On Hold", "Withdrew Application"
];

const ApplicantDetailView = ({ applicant, onClose, applicants, setSelectedApplicant }) => {

  const processIncomingApplicant = (app) => {
    if (!app) return null;

    let processedShortlisted = false;
    if (typeof app.shortlisted === 'boolean') {
      processedShortlisted = app.shortlisted;
    } else if (app.shortlisted === 'Yes') {
      processedShortlisted = true;
    }

    let processedRejected = false;
    if (typeof app.rejected === 'boolean') {
      processedRejected = app.rejected;
    } else if (app.rejected === 'Yes') {
      processedRejected = true;
    }

    return {
      ...app,
      name: app.name || 'N/A',
      email: app.email || 'N/A',
      position: app.position || 'N/A',
      shortlisted: processedShortlisted,
      rejected: processedRejected,
      shortlistedDate: app.shortlistedDate || null,
      rejectedDate: app.rejectedDate || null,
      isRead: typeof app.isRead === 'boolean' ? app.isRead : false,
      resumeStatus: app.resumeStatus || 'Pending Review',
      submittedAt: app.submittedAt?.toDate ? app.submittedAt.toDate() : new Date(app.submittedAt || Date.now()),
      statusHistory: app.statusHistory || [],
    };
  };

  const [currentApplicant, setCurrentApplicant] = useState(processIncomingApplicant(applicant));
  const [localResumeStatus, setLocalResumeStatus] = useState(currentApplicant?.resumeStatus || 'Pending Review');
  const [localIsRead, setLocalIsRead] = useState(currentApplicant?.isRead || false);
  const [newStatusNote, setNewStatusNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const processedApp = processIncomingApplicant(applicant);
    setCurrentApplicant(processedApp);
    setLocalIsRead(processedApp?.isRead || false);
    setLocalResumeStatus(processedApp?.resumeStatus || 'Pending Review');
  }, [applicant]);

  const currentIndex = applicants.findIndex(app => app.id === currentApplicant?.id);

  const handleNext = async () => {
    if (currentIndex < applicants.length - 1) {
      const nextApplicant = applicants[currentIndex + 1];
      setSelectedApplicant(nextApplicant);
      if (!nextApplicant.isRead) {
        try {
          const ref = doc(db, 'applications', nextApplicant.id);
          await updateDoc(ref, { isRead: true });
        } catch (error) {
          console.error("Error updating read status:", error);
        }
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevApplicant = applicants[currentIndex - 1];
      setSelectedApplicant(prevApplicant);
      if (!prevApplicant.isRead) {
        try {
          const ref = doc(db, 'applications', prevApplicant.id);
          await updateDoc(ref, { isRead: true });
        } catch (error) {
          console.error("Error updating read status:", error);
        }
      }
    }
  };


  const toggleApplicantReadStatus = async () => {
    if (!currentApplicant || !currentApplicant.id) return;
    const newReadStatus = !localIsRead;
    const applicantRef = doc(db, 'applications', currentApplicant.id);
    try {
      await updateDoc(applicantRef, { isRead: newReadStatus });
      setLocalIsRead(newReadStatus);
      setCurrentApplicant(prev => prev ? ({ ...prev, isRead: newReadStatus }) : null);
    } catch (error) {
      console.error("Error toggling applicant read status:", error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentApplicant || !currentApplicant.id) return;

    const newStatus = localResumeStatus;
    const originalApplicantState = { ...currentApplicant };

    const logEntry = {
      status: newStatus,
      timestamp: Timestamp.now(),
      notes: newStatusNote || `Status changed to ${newStatus}`,
      changedBy: 'admin'
    };

    let newShortlisted = currentApplicant.shortlisted;
    let newRejected = currentApplicant.rejected;
    let newShortlistedDate = currentApplicant.shortlistedDate;
    let newRejectedDate = currentApplicant.rejectedDate;
    const nowISO = new Date().toISOString();

    if (newStatus === 'Shortlisted' || newStatus === 'Offer Extended' || newStatus === 'Hired') {
      if (!currentApplicant.shortlisted) {
        newShortlistedDate = nowISO;
      }
      newShortlisted = true;
      newRejected = false;
      newRejectedDate = null;
    } else if (newStatus.startsWith('Rejected')) {
      if (!currentApplicant.rejected) {
        newRejectedDate = nowISO;
      }
      newRejected = true;
      newShortlisted = false;
      newShortlistedDate = null;
    } else if (newStatus === 'Pending Review' || newStatus === 'Viewed' || newStatus === 'Initial Screening' || newStatus === 'Interview Scheduled' || newStatus === 'Technical Assessment') {
      newShortlisted = false;
      newRejected = false;
      newShortlistedDate = null;
      newRejectedDate = null;
    }

    const updateDataForUI = {
      resumeStatus: newStatus,
      statusHistory: [...(currentApplicant.statusHistory || []), { ...logEntry, timestamp: new Date(logEntry.timestamp.seconds * 1000 + logEntry.timestamp.nanoseconds / 1000000) }],
      isRead: true,
      shortlisted: newShortlisted,
      rejected: newRejected,
      shortlistedDate: newShortlistedDate,
      rejectedDate: newRejectedDate,
    };

    setCurrentApplicant(prev => prev ? ({ ...prev, ...updateDataForUI }) : null);
    setLocalIsRead(true);
    setNewStatusNote('');

    const applicantRef = doc(db, 'applications', currentApplicant.id);
    const updateDataForFirestore = {
      resumeStatus: newStatus,
      statusHistory: arrayUnion(logEntry),
      isRead: true,
      shortlisted: newShortlisted,
      rejected: newRejected,
      shortlistedDate: newShortlistedDate,
      rejectedDate: newRejectedDate,
    };

    try {
      await updateDoc(applicantRef, updateDataForFirestore);
    } catch (error) {
      console.error("Error updating applicant status:", error);
      setCurrentApplicant(originalApplicantState);
      setLocalResumeStatus(originalApplicantState.resumeStatus);
      setLocalIsRead(originalApplicantState.isRead);
    }
  };

  const handleDownloadResume = () => {
    if (currentApplicant?.resume?.data) {
      const link = document.createElement('a');
      link.href = currentApplicant.resume.data;
      link.download = currentApplicant.resume.name || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!currentApplicant || !currentApplicant.id) return;
    try {
      await deleteDoc(doc(db, 'applications', currentApplicant.id));
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Error deleting applicant:", error);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Shortlisted' || status === 'Offer Extended' || status === 'Hired') return 'text-green-400';
    if (status && status.startsWith('Rejected')) return 'text-red-400';
    if (status === 'Viewed' || status === 'Initial Screening' || status === 'Interview Scheduled' || status === 'Technical Assessment') return 'text-blue-400';
    if (status === 'Pending Review') return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (!currentApplicant) {
    return (
      <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl max-w-4xl mx-auto">
          <p>Loading applicant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-700 rounded-t-lg shadow-md max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="flex items-center text-white hover:text-yellow-300 transition-colors p-2 rounded-full hover:bg-gray-600"
          aria-label="Back to list"
        >
          <FaArrowLeft size={18} />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className={`p-2 rounded-full transition-colors ${currentIndex <= 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
            aria-label="Previous applicant"
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= applicants.length - 1}
            className={`p-2 rounded-full transition-colors ${currentIndex >= applicants.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
            aria-label="Next applicant"
          >
            <FaChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-800 text-white p-6 rounded-b-lg shadow-2xl max-w-4xl mx-auto border border-gray-700 border-t-0">
        {/* Header within Content: Title and Action Icons */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-500">
            Applicant Details
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleApplicantReadStatus}
              title={localIsRead ? "Mark as Unread" : "Mark as Read"}
              className={`p-2 rounded-full transition-colors
                            ${localIsRead
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                : 'bg-yellow-600 hover:bg-yellow-500 text-white'
              }`}
            >
              {localIsRead ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
            <button
              onClick={confirmDelete}
              className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
              aria-label="Delete applicant"
            >
              <FaTrash size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Personal Information</h3>
            <p><strong className="text-gray-400">Name:</strong> {currentApplicant.name}</p>
            <p><strong className="text-gray-400">Email:</strong> <a href={`mailto:${currentApplicant.email}`} className="text-blue-400 hover:underline">{currentApplicant.email}</a></p>
            <p><strong className="text-gray-400">Phone:</strong> {currentApplicant.phone}</p>
            <p><strong className="text-gray-400">Submitted:</strong> {formatDateToLocal(currentApplicant.submittedAt)} ({getTimeAgo(currentApplicant.submittedAt)})</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Application Details</h3>
            <p><strong className="text-gray-400">Position:</strong> {currentApplicant.position}</p>
            <p><strong className="text-gray-400">Currently Employed:</strong> {currentApplicant.currentlyEmployed}</p>
            <p><strong className="text-gray-400">Salary Expectations:</strong> {currentApplicant.salaryExpectations || 'N/A'}</p>
            {currentApplicant.portfolioLink && (
              <p><strong className="text-gray-400">Portfolio:</strong> <a href={currentApplicant.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Portfolio <FaExternalLinkAlt className="inline ml-1" size={12} /></a></p>
            )}
            {currentApplicant.resume?.name && (
              <button
                onClick={handleDownloadResume}
                className="mt-2 inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                <FaDownload className="mr-2" /> Download Resume
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Manage Application</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-3">
              <label htmlFor="resumeStatus" className="block text-sm font-medium text-gray-400 mb-1">Application Stage</label>
              <select
                id="resumeStatus"
                value={localResumeStatus}
                onChange={(e) => setLocalResumeStatus(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              >
                {resumeStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="statusNote" className="block text-sm font-medium text-gray-400 mb-1">Notes for stage change (optional)</label>
            <textarea
              id="statusNote"
              rows="2"
              value={newStatusNote}
              onChange={(e) => setNewStatusNote(e.target.value)}
              placeholder="e.g., Passed initial screening, good fit for the role."
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            ></textarea>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md transition-colors"
            >
              Update Status
            </button>
          </div>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4">Status History</h3>
          {currentApplicant.statusHistory && currentApplicant.statusHistory.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-700 p-4 rounded-md">
              {currentApplicant.statusHistory.slice().sort((a, b) => {
                const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : (a.timestamp instanceof Date ? a.timestamp : new Date(0));
                const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : (b.timestamp instanceof Date ? b.timestamp : new Date(0));
                return dateB - dateA;
              }).map((log, index) => (
                <div key={index} className="p-3 bg-gray-600 rounded-md shadow">
                  <p className={`font-semibold ${getStatusColor(log.status)}`}>{log.status}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.timestamp?.toDate ? formatDateToLocal(log.timestamp.toDate()) : (log.timestamp instanceof Date ? formatDateToLocal(log.timestamp) : 'Date N/A')}
                    {log.changedBy && ` - By: ${log.changedBy}`}
                  </p>
                  {log.notes && <p className="text-sm text-gray-300 mt-1 italic">Notes: {log.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No status history yet.</p>
          )}
        </div>

        <DeleteConfirmModal
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Confirm Applicant Deletion"
          message="Are you sure you want to delete this applicant? This action cannot be undone."
        />
      </div>
    </div>
  );
};

ApplicantDetailView.propTypes = {
  applicant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    position: PropTypes.string,
    currentlyEmployed: PropTypes.string,
    salaryExpectations: PropTypes.string,
    portfolioLink: PropTypes.string,
    resume: PropTypes.shape({
      name: PropTypes.string,
      data: PropTypes.string,
    }),
    submittedAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object, PropTypes.string]),
    isRead: PropTypes.bool,
    resumeStatus: PropTypes.string,
    statusHistory: PropTypes.arrayOf(PropTypes.shape({
      status: PropTypes.string,
      timestamp: PropTypes.any,
      notes: PropTypes.string,
      changedBy: PropTypes.string
    })),
    shortlisted: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    shortlistedDate: PropTypes.string,
    rejected: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    rejectedDate: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  applicants: PropTypes.arrayOf(PropTypes.object),
  setSelectedApplicant: PropTypes.func
};

export default ApplicantDetailView;