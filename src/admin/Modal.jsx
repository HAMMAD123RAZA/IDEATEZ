// client/src/admin/modal.jsx
import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default Modal;