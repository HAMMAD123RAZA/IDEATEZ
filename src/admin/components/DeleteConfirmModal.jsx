// FILE: client/src/admin/components/DeleteConfirmModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const DeleteConfirmModal = ({ show, onClose, onConfirm, title = "Confirm", message = "Are you sure?" }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="bg-white text-gray-900 rounded-lg shadow-lg max-w-md w-full z-10 overflow-auto border border-gray-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <p className="mb-6 text-base text-gray-800">{message}</p>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
            >
              Delete Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default DeleteConfirmModal;