// FILE: client/src/admin/components/PasswordResetModal.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import NotificationModal from './NotificationModal';
import { motion } from 'framer-motion';

const PasswordResetModal = ({ show, onClose, onConfirm, userDisplayName }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const constraintsRef = useRef(null);


  const handleInternalClose = () => {
    setError('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    onConfirm(newPassword);
  };

  if (!show) return null;

  return (
    <div ref={constraintsRef} className="fixed inset-0 flex justify-center items-center p-4 z-50">
      <div
        className="fixed inset-0"
        onClick={handleInternalClose}
        aria-hidden="true"
      ></div>
      <motion.div
        drag
        dragConstraints={constraintsRef}
        className="bg-white text-gray-900 rounded-lg shadow-2xl max-w-md w-full z-10 border border-gray-300 cursor-move"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-yellow-600 flex items-center">
              <FaKey className="mr-2 text-yellow-500" /> Reset Password for {userDisplayName}
            </h3>
            <button
              onClick={handleInternalClose}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {error && (
            <NotificationModal
              show={!!error}
              onClose={() => setError('')}
              title="Validation Error"
              message={error}
              type="error"
            />
          )}

          <div className="space-y-4 mt-4 cursor-auto">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-gray-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 cursor-auto">
            <button
              onClick={handleInternalClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none transition-colors"
            >
              Reset Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

PasswordResetModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  userDisplayName: PropTypes.string.isRequired,
};

export default PasswordResetModal;