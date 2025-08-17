
// FILE: client/src/admin/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import AdminGraph from './DashboardGraph';
import { FaUsers, FaEnvelopeOpenText, FaUserCheck, FaUserSlash, FaBookOpen, FaBookReader } from 'react-icons/fa';
import PermissionGuard from './components/PermissionGuard'; // Import PermissionGuard

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    messages: { total: 0, read: 0, unread: 0 },
    applicants: { total: 0, read: 0, unread: 0 },
  });

  const fetchData = async () => {
    try {
      // Users
      const userSnapshot = await getDocs(collection(db, 'users'));
      let usersCount = 0;
      let activeUsers = 0;
      let inactiveUsers = 0;
      userSnapshot.forEach(doc => {
        usersCount++;
        if (doc.data().isActive === true) {
          activeUsers++;
        } else {
          inactiveUsers++;
        }
      });

      // Messages
      const messagesSnapshot = await getDocs(collection(db, 'Get_A_Quote'));
      let messagesCount = 0;
      let readMessages = 0;
      let unreadMessages = 0;
      messagesSnapshot.forEach(doc => {
        messagesCount++;
        if (doc.data().isRead === true) {
          readMessages++;
        } else {
          unreadMessages++;
        }
      });

      // Applicants
      const applicantsSnapshot = await getDocs(collection(db, 'applications'));
      let applicantsCount = 0;
      let readApplicants = 0;
      let unreadApplicants = 0;
      applicantsSnapshot.forEach(doc => {
        applicantsCount++;
        if (doc.data().isRead === true) {
          readApplicants++;
        } else {
          unreadApplicants++;
        }
      });

      setStats({
        users: { total: usersCount, active: activeUsers, inactive: inactiveUsers },
        messages: { total: messagesCount, read: readMessages, unread: unreadMessages },
        applicants: { total: applicantsCount, read: readApplicants, unread: unreadApplicants },
      });

    } catch (error) {
      console.log('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <PermissionGuard permission="dashboard_view_user_card">
          <Link to="/admin/users" className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg hover:scale-105 block">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats.users.total.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers size={28} />
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="flex items-center"><FaUserCheck className="mr-1.5 text-green-500"/> Active: {stats.users.active.toLocaleString()}</p>
              <p className="flex items-center"><FaUserSlash className="mr-1.5 text-red-500"/> Inactive: {stats.users.inactive.toLocaleString()}</p>
            </div>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission="dashboard_view_messages_card">
          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-3xl font-bold text-gray-800">{stats.messages.total.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaEnvelopeOpenText size={28} />
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="flex items-center"><FaBookReader className="mr-1.5 text-green-500"/> Read: {stats.messages.read.toLocaleString()}</p>
              <p className="flex items-center"><FaBookOpen className="mr-1.5 text-yellow-500"/> Unread: {stats.messages.unread.toLocaleString()}</p>
            </div>
          </div>
        </PermissionGuard>

        <PermissionGuard permission="dashboard_view_applicants_card">
          <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-800">{stats.applicants.total.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaUserCheck size={28} /> {/* Changed icon for consistency or can be more specific */}
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="flex items-center"><FaBookReader className="mr-1.5 text-green-500"/> Read: {stats.applicants.read.toLocaleString()}</p>
              <p className="flex items-center"><FaBookOpen className="mr-1.5 text-yellow-500"/> Unread: {stats.applicants.unread.toLocaleString()}</p>
            </div>
          </div>
        </PermissionGuard>
      </div>

      <PermissionGuard any={['dashboard_view_message_analytics', 'dashboard_view_applicant_analytics', 'dashboard_view_user_analytics']}>
        <AdminGraph />
      </PermissionGuard>
    </div>
  );
};

export default AdminDashboard;