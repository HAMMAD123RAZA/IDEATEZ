
// FILE: client/src/admin/components/MessageDetailView.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Keep deleteDoc for actual deletion
import { db } from '../../utils/firebase';
import { formatDateToLocal, getTimeAgo } from '../../utils/dateUtils';
import { FaEye, FaEyeSlash, FaTrash, FaReply, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useAuth } from '../AuthContext'; // Import useAuth

const MessageDetailView = ({ message, onClose, requests, setSelectedRequest, onToggleRead, canToggleRead, canDelete, onDeleteRequest }) => {
  const [isRead, setIsRead] = useState(message.isRead || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { hasPermission } = useAuth(); // Get hasPermission

  const currentIndex = requests.findIndex(req => req.id === message.id);

  const handleNext = async () => {
    if (currentIndex < requests.length - 1) {
      const nextRequest = requests[currentIndex + 1];
      setSelectedRequest(nextRequest);
      if (!nextRequest.isRead && hasPermission('edit_message_status')) {
        try {
          const ref = doc(db, 'Get_A_Quote', nextRequest.id);
          await updateDoc(ref, { isRead: true });
        } catch (error) {
          console.error("Error updating read status:", error);
        }
      }
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevRequest = requests[currentIndex - 1];
      setSelectedRequest(prevRequest);
      if (!prevRequest.isRead && hasPermission('edit_message_status')) {
        try {
          const ref = doc(db, 'Get_A_Quote', prevRequest.id);
          await updateDoc(ref, { isRead: true });
        } catch (error) {
          console.error("Error updating read status:", error);
        }
      }
    }
  };

  const toggleLocalReadStatus = async () => {
    if (!hasPermission('edit_message_status')) return;
    const newReadStatus = !isRead;
    try {
      const ref = doc(db, 'Get_A_Quote', message.id);
      await updateDoc(ref, { isRead: newReadStatus }); 
      setIsRead(newReadStatus); 
      // If an external onToggleRead is provided (like from UserRequests parent), call it
      if (onToggleRead) {
          onToggleRead(message.id, newReadStatus);
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
  };

  const confirmDeleteLocal = () => {
    if (!hasPermission('delete_message')) {
        alert("You don't have permission to delete this message.");
        return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteLocal = async () => {
    if (!hasPermission('delete_message')) return;
    try {
      const ref = doc(db, 'Get_A_Quote', message.id);
      await deleteDoc(ref);
      setShowDeleteConfirm(false);
      onClose(); 
    } catch (err) {
      console.error('Error deleting message:', err);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-yellow-600 overflow-hidden">
      {/* Top Bar with Back Button and Nav Icons */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
        <button
          onClick={onClose}
          className="flex items-center text-white hover:text-yellow-300 transition-colors p-2 rounded-full hover:bg-gray-600"
          aria-label="Back to List"
        >
          <FaArrowLeft size={18} className="mr-1" /> 
        </button>
        <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              className={`p-2 rounded-full transition-colors ${currentIndex <= 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
              aria-label="Previous message"                     
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= requests.length - 1}
              className={`p-2 rounded-full transition-colors ${currentIndex >= requests.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
              aria-label="Next message"
            >
              <FaChevronRight size={18} />
            </button>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-yellow-600 text-white px-4 py-3 flex justify-between items-start">
        <div>
          <strong className="block opacity-80">Topic</strong>
          <h2 className="text-xl font-bold">{message.service || '—'}</h2>
          <p className="text-sm mt-1 opacity-90">
            {formatDateToLocal(message.createdAt)}{' '}
            <span className="opacity-70">({getTimeAgo(message.createdAt)} ago)</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
            <button
                onClick={toggleLocalReadStatus}
                title={isRead ? "Mark as Unread" : "Mark as Read"}
                disabled={!hasPermission('edit_message_status')}
                className={`p-2 rounded-full transition-colors
                            ${isRead 
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-800'
                                : 'bg-white hover:bg-gray-200 text-yellow-700'
                            }
                            ${!hasPermission('edit_message_status') ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
            >
                {isRead ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
            </button>
            {hasPermission('delete_message') && (
              <button
                onClick={confirmDeleteLocal}
                title="Delete Message"
                className="text-gray-800 hover:text-red-700 p-2 rounded-full transition-colors hover:bg-red-500/10 focus:outline-none"
              >
                <FaTrash size={18} />
              </button>
            )}
        </div>
      </div>

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pt-3 pb-3 bg-yellow-700 bg-opacity-70 text-sm text-white">
        <div>
          <strong className="block opacity-80">Name</strong>
          <p>{message.name || '—'}</p>
        </div>
        <div>
          <strong className="block opacity-80">Email</strong>
          <p>{message.email || '—'}</p>
        </div>
        <div>
          <strong className="block opacity-80">Phone</strong>
          <p>{message.contact || message.phone || '—'}</p>
        </div>
        <div>
          <strong className="block opacity-80">Company</strong>
          <p>{message.company || '—'}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-800 text-gray-300">
        <div className="mb-6">
          <strong className="text-sm uppercase tracking-wider opacity-70">Message</strong>
          <p className="mt-2 p-3 bg-gray-900 rounded-md whitespace-pre-wrap">
            {message.message || 'No message content'}
          </p>
        </div>

        {message.formData && Object.keys(message.formData).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Form Data</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(message.formData).map(([key, val]) => (
                <div key={key} className="bg-gray-700 p-2 rounded">
                  <strong className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </strong>
                  <p className="mt-1">{val || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-700 px-4 py-3 flex justify-end items-center"> 
        {hasPermission('messages_reply_message') && (
            <a
            href={`mailto:${message.email}?subject=Re: ${message.service || 'Your Request'}&body=Dear ${message.name},\n\n`}
            className="flex items-center text-white hover:text-blue-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            >
            <FaReply className="mr-1" />
            Reply
            </a>
        )}
      </div>

      <DeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteLocal}
        title="Confirm Message Deletion"
        message="Are you sure you want to delete this message?"
      />
    </div>
  );
};

MessageDetailView.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    contact: PropTypes.string,
    phone: PropTypes.string,
    message: PropTypes.string,
    service: PropTypes.string,
    subject: PropTypes.string,
    createdAt: PropTypes.instanceOf(Date),
    formData: PropTypes.object,
    isRead: PropTypes.bool
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  requests: PropTypes.arrayOf(PropTypes.object),
  setSelectedRequest: PropTypes.func,
  onToggleRead: PropTypes.func, // For parent to update its list
  canToggleRead: PropTypes.bool, // Prop to indicate if parent allows toggling
  canDelete: PropTypes.bool,
  onDeleteRequest: PropTypes.func,
};

export default MessageDetailView;