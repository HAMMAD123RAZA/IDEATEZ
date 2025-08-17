
// FILE: client/src/App.jsx

import React from 'react'
import { Routes, Route, BrowserRouter as Router, Outlet, Navigate } from 'react-router-dom' // Import Outlet, Navigate

// Layouts
import AdminWrapper from './admin/AdminWrapper'
import { AuthProvider, useAuth } from './admin/AuthContext'; // Import AuthProvider and useAuth

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import WebAppDev from './components/WebAppDev'
import Digital_Marketing from './components/Digital_Marketing'
import Design_Development from './components/Design_Development'
import Digital_Marketing_Outsourcing from './components/Digital_Marketing_Outsourcing'
import Get_A_Quote from './components/Get_A_Quote'
import PortfolioHero from './components/PortfolioHero'
import Careers from './components/contact/careers'
import AboutUs from './components/aboutUs/AboutUs'
import ServicesNav from './components/ServicesNav'
import PortfolioHome from './components/portfolioProject'

// Admin Components
import Dashboard from './admin/Dashboard'
import UserRequests from './admin/UserRequests'
import Applicants from './admin/Applicants'
import RoleManagement from './admin/RoleManagement';
import UserManagement from './admin/UserManagement';
import UserDetailView from './admin/components/UserDetailView';
import PermissionManagement from './admin/PermissionManagement'; 
import PermissionGuard from './admin/components/PermissionGuard'; // Import PermissionGuard

// Task Management Components
import TaskDashboard from './admin/TaskManagement/TaskDashboard';
import TaskList from './admin/TaskManagement/TaskList';
import TaskDetailView from './admin/TaskManagement/TaskDetailView';
import LoginPage from './admin/Login';


const DefaultLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
)

// AdminLayout component to wrap admin routes
const AdminLayout = () => {
  return (
    <AdminWrapper>
      <Outlet /> 
    </AdminWrapper>
  );
};

// PrivateRoute to protect admin pages
const PrivateRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return currentUser ? <AdminLayout /> : <Navigate to="/admin/login" replace />;
};

const DASHBOARD_PERMISSIONS = [
  'dashboard_view_user_card',
  'dashboard_view_messages_card',
  'dashboard_view_applicants_card',
  'dashboard_view_message_analytics',
  'dashboard_view_applicant_analytics',
  'dashboard_view_user_analytics'
];

const MESSAGES_PERMISSIONS = ['messages_view_list', 'messages_view_detail', 'edit_message_status', 'delete_message', 'messages_reply_message'];
const APPLICANTS_PERMISSIONS = ['view_applicants_list', 'view_applicant_details', 'edit_applicant_status', 'delete_applicant'];
const TASKS_PERMISSIONS = ['tasks_view_list', 'tasks_view_dashboard', 'tasks_create'];
const ROLES_PERMISSIONS = ['view_roles_list', 'add_role', 'edit_role_name_description', 'delete_role'];
const USERS_PERMISSIONS = ['view_users_list', 'add_user'];


const App = () => {
  return (
    <Router>
      <AuthProvider> 
        <Routes>
          <Route path="/admin" element={<PrivateRoute />}>
            <Route index element={<PermissionGuard any={DASHBOARD_PERMISSIONS}><Dashboard /></PermissionGuard>} />
            <Route path="dashboard" element={<PermissionGuard any={DASHBOARD_PERMISSIONS}><Dashboard /></PermissionGuard>} />
            <Route path="request" element={<PermissionGuard any={MESSAGES_PERMISSIONS}><UserRequests /></PermissionGuard>} />
            <Route path="app" element={<PermissionGuard any={APPLICANTS_PERMISSIONS}><Applicants /></PermissionGuard>} />
            
            {/* Task Management Routes */}
            <Route path="tasks" element={<PermissionGuard any={TASKS_PERMISSIONS}><TaskList /></PermissionGuard>} />
            <Route path="tasks/dashboard" element={<PermissionGuard permission="tasks_view_dashboard"><TaskDashboard /></PermissionGuard>} />
            <Route path="tasks/:taskId" element={<PermissionGuard permission="tasks_view_details"><TaskDetailView /></PermissionGuard>} />

            {/* Settings Sub-routes */}
            <Route path="roles" element={<PermissionGuard any={ROLES_PERMISSIONS}><RoleManagement /></PermissionGuard>} />
            <Route path="users" element={<PermissionGuard any={USERS_PERMISSIONS}><UserManagement /></PermissionGuard>} />
            <Route path="users/:userId" element={<PermissionGuard permission="view_user_details"><UserDetailView /></PermissionGuard>} />
            <Route path="permissions" element={<PermissionGuard permission="edit_role_permissions"><PermissionManagement /></PermissionGuard>} />
          </Route>
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Public Routes */}
          <Route path='/' element={
            <DefaultLayout>
              <Home />
            </DefaultLayout>
          } />
          <Route path='/Web_&_App_Development' element={
            <DefaultLayout>
              <WebAppDev />
            </DefaultLayout>
          } />
          <Route path='/Digital_Marketing' element={
            <DefaultLayout>
              <Digital_Marketing />
            </DefaultLayout>
          } />
          <Route path='/Digital_Marketing_Outsourcing' element={
            <DefaultLayout>
              <Digital_Marketing_Outsourcing />
            </DefaultLayout>
          } />
          <Route path='/Design_&_Development' element={
            <DefaultLayout>
              <Design_Development />
            </DefaultLayout>
          } />
          <Route path='/Get_A_Quote' element={
            <DefaultLayout>
              <Get_A_Quote />
            </DefaultLayout>
          } />
          <Route path='/portfolio' element={
            <DefaultLayout>
              <PortfolioHero />
            </DefaultLayout>
          } />
          <Route path='/careers' element={
            <DefaultLayout>
              <Careers />
            </DefaultLayout>
          } />
          <Route path='/AboutUs' element={
            <DefaultLayout>
              <AboutUs />
            </DefaultLayout>
          } />
          <Route path='/Services' element={
            <DefaultLayout>
              <ServicesNav />
            </DefaultLayout>
          } />
          <Route path='/port' element={
            <DefaultLayout>
              <PortfolioHome />
            </DefaultLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
