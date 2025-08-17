
// client/src/admin/Sidebar.jsx
import React, { useState } from 'react'; // Added useState
import { MdOutlineDashboardCustomize, MdManageAccounts, MdLogout, MdSettings, MdAssignment } from 'react-icons/md'; // Added MdSettings & MdAssignment
import { IoPeopleCircleOutline } from 'react-icons/io5';
import { IoIosContact } from 'react-icons/io';
import { BsShieldLock, BsKeyFill } from 'react-icons/bs'; 
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Added Chevron icons
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from './AuthContext'; 

const SideBar = () => {
  const { hasAnyPermission, loading: loadingPermissions, logout } = useAuth();
  const navigate = useNavigate(); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings submenu

  const handleSignOut = () => {
    logout();
    navigate('/admin/login'); 
  };

  if (loadingPermissions) {
    return (
        <div className="w-72 bg-gradient-to-b from-[#303a67] via-[#1a1a1c] to-gray-900 text-white h-full flex flex-col justify-center items-center">
            <div className="animate-pulse text-gray-400">Loading Menu...</div>
        </div>
    );
  }

  // Permission Groups for Menu Visibility
  const DASHBOARD_PERMS = ['dashboard_view_user_card', 'dashboard_view_messages_card', 'dashboard_view_applicants_card', 'dashboard_view_message_analytics', 'dashboard_view_applicant_analytics', 'dashboard_view_user_analytics'];
  const MESSAGES_PERMS = ['messages_view_list', 'messages_view_detail', 'edit_message_status', 'delete_message', 'messages_reply_message'];
  const APPLICANTS_PERMS = ['view_applicants_list', 'view_applicant_details', 'edit_applicant_status', 'delete_applicant'];
  const TASKS_PERMS = ['tasks_view_dashboard', 'tasks_view_list', 'tasks_create', 'tasks_edit_all', 'tasks_view_own_assigned'];
  const USERS_PERMS = ['view_users_list', 'add_user', 'edit_user_details', 'delete_user'];
  const ROLES_PERMS = ['view_roles_list', 'add_role', 'edit_role_name_description', 'delete_role'];
  const PERMISSIONS_PERMS = ['edit_role_permissions'];

  // Check if any of the main menu categories should be visible
  const canViewDashboard = hasAnyPermission(DASHBOARD_PERMS);
  const canViewMessages = hasAnyPermission(MESSAGES_PERMS);
  const canViewApplicants = hasAnyPermission(APPLICANTS_PERMS);
  const canViewTasks = hasAnyPermission(TASKS_PERMS);
  
  // Specific checks for sub-menus
  const canViewUsers = hasAnyPermission(USERS_PERMS);
  const canViewRoles = hasAnyPermission(ROLES_PERMS);
  const canViewPermissions = hasAnyPermission(PERMISSIONS_PERMS);

  // Parent settings menu is visible if any of its children are
  const canViewSettings = canViewUsers || canViewRoles || canViewPermissions;

  return (
    <div className="w-72 bg-gradient-to-b from-[#303a67] via-[#1a1a1c] to-gray-900 text-white h-full flex flex-col border-r border-gray-700/30 shadow-lg">
      <div className="flex flex-col flex-1">
        <div className="flex justify-center py-8 px-4">
          <img
            src="/da-log.png" 
            alt="Company Logo"
            className="bg-gray-800 p-1 rounded-full w-28 h-28 object-contain ring-2 ring-yellow-500 shadow-md"
          />
        </div>

        <nav className="flex flex-col flex-1 px-3 py-2 gap-1.5">
          
          {canViewDashboard && (
            <Link
              to="/admin/dashboard"
              className="flex gap-3 items-center px-4 py-2.5 rounded-lg hover:bg-yellow-600/20 text-gray-200 hover:text-yellow-300 transition-all duration-200"
            >
              <MdOutlineDashboardCustomize size={22} />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
          )}

          {canViewMessages && (
            <Link
              to="/admin/request"
              className="flex gap-3 items-center px-4 py-2.5 rounded-lg hover:bg-yellow-600/20 text-gray-200 hover:text-yellow-300 transition-all duration-200"
            >
              <IoIosContact size={22} />
              <span className="font-medium text-sm">Messages</span>
            </Link>
          )}
          
          {canViewApplicants && (
            <Link
              to="/admin/app"
              className="flex gap-3 items-center px-4 py-2.5 rounded-lg hover:bg-yellow-600/20 text-gray-200 hover:text-yellow-300 transition-all duration-200"
            >
              <IoPeopleCircleOutline size={22} />
              <span className="font-medium text-sm">Applicants</span>
            </Link>
          )}

          {canViewTasks && (
            <Link
              to="/admin/tasks"
              className="flex gap-3 items-center px-4 py-2.5 rounded-lg hover:bg-yellow-600/20 text-gray-200 hover:text-yellow-300 transition-all duration-200"
            >
              <MdAssignment size={22} />
              <span className="font-medium text-sm">Task Management</span>
            </Link>
          )}

          {/* Settings Menu */}
          {canViewSettings && (
            <div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex justify-between items-center px-4 py-2.5 rounded-lg hover:bg-yellow-600/20 text-gray-200 hover:text-yellow-300 transition-all duration-200"
                aria-expanded={isSettingsOpen}
              >
                <div className="flex gap-3 items-center">
                  <MdSettings size={22} />
                  <span className="font-medium text-sm">Settings</span>
                </div>
                {isSettingsOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </button>
              {isSettingsOpen && (
                <div className="pl-4 mt-1 space-y-1">
                  {canViewUsers && (
                    <Link
                      to="/admin/users"
                      className="flex gap-3 items-center px-4 py-2 rounded-lg hover:bg-yellow-600/10 text-gray-300 hover:text-yellow-200 transition-all duration-200 text-xs"
                    >
                      <MdManageAccounts size={20} className="ml-1"/>
                      <span className="font-medium">User Management</span>
                    </Link>
                  )}

                  {canViewRoles && (
                    <Link
                      to="/admin/roles"
                      className="flex gap-3 items-center px-4 py-2 rounded-lg hover:bg-yellow-600/10 text-gray-300 hover:text-yellow-200 transition-all duration-200 text-xs"
                    >
                      <BsShieldLock size={18} className="ml-1.5"/> 
                      <span className="font-medium">Role Definitions</span>
                    </Link>
                  )}

                  {canViewPermissions && (
                    <Link
                      to="/admin/permissions"
                      className="flex gap-3 items-center px-4 py-2 rounded-lg hover:bg-yellow-600/10 text-gray-300 hover:text-yellow-200 transition-all duration-200 text-xs"
                    >
                      <BsKeyFill size={18} className="ml-1.5" /> 
                      <span className="font-medium">Permission Matrix</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex-grow"></div>

          <button
            onClick={handleSignOut}
            className="flex gap-3 items-center px-4 py-2.5 mt-4 mb-2 rounded-lg hover:bg-red-600/30 text-gray-300 hover:text-red-400 transition-all duration-200 border-t border-gray-700/50 pt-3"
          >
            <MdLogout size={22} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
