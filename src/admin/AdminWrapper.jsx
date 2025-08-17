// client/src/admin/AdminWrapper.jsx
import React, { useState, useRef, useEffect } from 'react';
import SideBar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import { FiMenu, FiX } from 'react-icons/fi';

export default function AdminWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest('button[aria-label*="sidebar"]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#060918] to-gray-900 overflow-hidden">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg transition-all duration-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#303a67] via-[#1a1a1c] to-gray-900 
                    border-r border-gray-700/50 shadow-2xl
                    transform transition-transform duration-300 ease-in-out 
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <SideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {/* The children (actual page content) will be rendered here */}
          {children}
        </main>
      </div>
    </div>
  );
}