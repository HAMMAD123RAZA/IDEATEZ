import React, { useEffect, useState } from 'react';
import { FaRegBell } from 'react-icons/fa6';
import { useNavigate, Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadApplicantsCount, setUnreadApplicantsCount] = useState(0);

  useEffect(() => {
    // Listener for unread messages
    const messagesQuery = query(
      collection(db, 'Get_A_Quote'),
      where('isRead', '==', false)
    );
    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setUnreadMessagesCount(snapshot.size);
      },
      (error) => {
        console.log('Error getting unread messages: ', error);
      }
    );

    // Listener for unread applicants
    const applicantsQuery = query(
      collection(db, 'applications'),
      where('isRead', '==', false)
    );
    const unsubscribeApplicants = onSnapshot(
      applicantsQuery,
      (snapshot) => {
        setUnreadApplicantsCount(snapshot.size);
      },
      (error) => {
        console.log('Error getting unread applicants: ', error);
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeApplicants();
    };
  }, []);

  const totalUnreadCount = unreadMessagesCount + unreadApplicantsCount;

  return (
    <div className="bg-gradient-to-b from-[#505983] via-[#232325] to-[#232325] p-3 sm:p-4 flex justify-between items-center border-b border-gray-800 shadow-sm">
      {/* Mobile burger menu placeholder - left side */}
      <div className="md:hidden">
        {/* Burger menu will be placed here by parent component */}
      </div>
      
      <div className="flex gap-3 sm:gap-4 md:gap-6 items-center md:ml-auto">
        <button
          className="p-1.5 sm:p-2 rounded-lg hover:bg-yellow-600/40 text-white transition-all duration-200 relative"
          aria-label={`Notifications: ${totalUnreadCount} unread`}
        >
          <FaRegBell size={18} className="sm:w-5 sm:h-5" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center min-w-[16px] sm:min-w-[20px]">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </button>
        
        <img
          className="bg-gray-900 rounded-full w-8 h-8 sm:w-10 sm:h-10 object-cover object-right ring-1 ring-yellow-600"
          src="/da-log.png"
          alt="Admin Profile"
        />
      </div>
    </div>
  );
};

export default AdminNavbar;