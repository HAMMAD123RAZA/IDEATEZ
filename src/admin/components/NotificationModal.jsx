// FILE: client/src/admin/components/NotificationModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const NotificationModal = ({ show, onClose, title, message, type = 'info' }) => {
  if (!show) return null;

  let IconComponent;
  let iconColorClass;
  let titleColorClass;

  switch (type) {
    case 'success':
      IconComponent = FaCheckCircle;
      iconColorClass = 'text-green-500';
      titleColorClass = 'text-green-700';
      break;
    case 'error':
      IconComponent = FaExclamationCircle;
      iconColorClass = 'text-red-500';
      titleColorClass = 'text-red-700';
      break;
    case 'info':
    default:
      IconComponent = FaInfoCircle;
      iconColorClass = 'text-blue-500';
      titleColorClass = 'text-blue-700';
      break;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
       {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className="bg-white text-gray-900 rounded-lg shadow-xl max-w-md w-full z-10 overflow-auto border border-gray-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              {IconComponent && <IconComponent size={24} className={`mr-3 ${iconColorClass}`} />}
              <h3 className={`text-xl font-semibold ${titleColorClass}`}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <p className="mb-6 text-base text-gray-700">{message}</p>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
};

export default NotificationModal;