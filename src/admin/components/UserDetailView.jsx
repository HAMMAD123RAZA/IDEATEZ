// FILE: client/src/admin/components/UserDetailView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUserManagement } from '../hooks/useUserManagement';
import { useRoleManagement } from '../hooks/useRoleManagement';
import { FaArrowLeft, FaSave, FaTrash, FaUserShield, FaEdit, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import DeleteConfirmModal from './DeleteConfirmModal';
import PasswordResetModal from './PasswordResetModal'; 
import NotificationModal from './NotificationModal'; 
import { formatDateToLocal, getTimeAgo } from '../../utils/dateUtils';
import { useAuth } from '../AuthContext';
import CryptoJS from 'crypto-js';

const UserDetailView = () => {
    const { userId } = useParams(); // This userId is the document ID
    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermission } = useAuth();

    const { getUser, updateUser, deleteUser, loading: userHookLoadingInitial, error: userErrorHook, users } = useUserManagement();
    const { roles, loading: rolesLoading, error: rolesErrorHook } = useRoleManagement();

    const [userData, setUserData] = useState(null);
    const [internalLoading, setInternalLoading] = useState(true); 
    const [editableData, setEditableData] = useState({
        displayName: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        bio: '',
        roleId: '',
        isActive: true,
    });
    const [isEditMode, setIsEditMode] = useState(location.state?.editMode || false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('info');

    const displayNotification = (title, message, type = 'info') => {
        setNotificationTitle(title);
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotificationModal(true);
    };
    
    const clearNotifications = () => {
      setShowNotificationModal(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationType('info');
    }

    useEffect(() => {
        if (userErrorHook && !showNotificationModal) {
            displayNotification('Error', userErrorHook, 'error');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userErrorHook]);

    const currentIndex = userData && users && users.length > 0 ? users.findIndex(u => u.id === userData.id) : -1;

    const fetchUserData = useCallback(async (idToFetch) => {
        setInternalLoading(true); 
        const user = await getUser(idToFetch); // idToFetch is document ID
        if (user) {
            setUserData(user);
            setEditableData({
                displayName: user.displayName || '',
                phone: user.phone || '',
                companyName: user.companyName || '',
                jobTitle: user.jobTitle || '',
                bio: user.bio || '',
                roleId: user.roleId || '',
                isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
            });
        } else {
            setUserData(null); 
            if (!userErrorHook) { 
                 displayNotification('Error', 'User not found.', 'error');
            }
        }
        setInternalLoading(false); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getUser]);

    useEffect(() => {
        if (userId) { // userId is doc ID from URL params
            fetchUserData(userId);
        }
        setIsEditMode(location.state?.editMode || false);
    }, [userId, fetchUserData, location.state?.editMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditableData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveChanges = async () => {
        if (!editableData.displayName.trim()) {
            displayNotification('Validation Error', 'Display Name cannot be empty.', 'error');
            return;
        }
        if (!hasPermission('edit_user_details') && !hasPermission('edit_user_role') && !hasPermission('edit_user_status')) {
            displayNotification('Error', 'You do not have permission to save changes.', 'error');
            return;
        }
        clearNotifications();
        setInternalLoading(true);

        const changesToUpdate = {};
        if (hasPermission('edit_user_details')) {
            changesToUpdate.displayName = editableData.displayName;
            changesToUpdate.phone = editableData.phone;
            changesToUpdate.companyName = editableData.companyName;
            changesToUpdate.jobTitle = editableData.jobTitle;
            changesToUpdate.bio = editableData.bio;
        }
        if (hasPermission('edit_user_role')) {
            changesToUpdate.roleId = editableData.roleId;
        }
        if (hasPermission('edit_user_status')) {
            changesToUpdate.isActive = editableData.isActive;
        }
        
        if (Object.keys(changesToUpdate).length === 0) {
            displayNotification('Info', 'No changes to save or no permission to save allowed fields.', 'info');
            setInternalLoading(false);
            setIsEditMode(false);
            return;
        }

        const success = await updateUser(userId, changesToUpdate); // userId is doc ID
        if (success) {
            displayNotification('Success', 'User updated successfully!', 'success');
            await fetchUserData(userId); 
            setIsEditMode(false);
        } else {
             if (!userErrorHook) { 
                displayNotification('Error', 'Failed to update user. Please try again.', 'error');
            }
        }
        setInternalLoading(false);
    };

    const handlePasswordReset = async (newPassword) => {
        if (!hasPermission('reset_user_password')) {
            displayNotification('Error', 'You do not have permission to reset passwords.', 'error');
            setShowPasswordResetModal(false);
            return;
        }
        clearNotifications();
        setInternalLoading(true);

        const staticKey = 'meriChabi';
        const encryptedPassword = CryptoJS.AES.encrypt(newPassword, staticKey).toString();

        const success = await updateUser(userId, { password: encryptedPassword }); // userId is doc ID
        setInternalLoading(false);
        setShowPasswordResetModal(false);

        if (success) {
            displayNotification('Success', 'Password reset successfully!', 'success');
            await fetchUserData(userId); 
        } else {
            if (!userErrorHook) {
                displayNotification('Error', 'Failed to reset password. Please try again.', 'error');
            }
        }
    };

    const handleDeleteUser = async () => {
        if(!hasPermission('delete_user')) {
            displayNotification('Error', 'You do not have permission to delete users.', 'error');
            setShowDeleteConfirm(false);
            return;
        }
        setInternalLoading(true);
        clearNotifications();
        const success = await deleteUser(userId); // userId is doc ID
        if (success) {
            setShowDeleteConfirm(false);
            setNotificationTitle('Success');
            setNotificationMessage('User deleted successfully.');
            setNotificationType('success');
            setShowNotificationModal(true);
            setTimeout(() => {
                setShowNotificationModal(false); 
                navigate('/admin/users');
            }, 2000);
        } else {
            setShowDeleteConfirm(false);
            if (!userErrorHook) { 
                displayNotification('Error', 'Failed to delete user.', 'error');
            }
        }
        setInternalLoading(false);
    };

    const getRoleName = useCallback((roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'N/A';
    }, [roles]);
    
    const combinedLoading = internalLoading || userHookLoadingInitial || rolesLoading;
    const canEditAnyField = hasPermission('edit_user_details') || hasPermission('edit_user_role') || hasPermission('edit_user_status');

    const handleNext = () => {
        if (users && currentIndex !== -1 && currentIndex < users.length - 1) {
            const nextUser = users[currentIndex + 1];
            navigate(`/admin/users/${nextUser.id}`, { state: { editMode: isEditMode } }); // nextUser.id is doc ID
        }
    };

    const handlePrevious = () => {
        if (users && currentIndex !== -1 && currentIndex > 0) {
            const prevUser = users[currentIndex - 1];
            navigate(`/admin/users/${prevUser.id}`, { state: { editMode: isEditMode } }); // prevUser.id is doc ID
        }
    };

    const renderContent = () => {
        if (combinedLoading) {
            return (
                <div className="text-center p-10">
                    <p className="text-gray-300 text-lg">Loading user details...</p>
                </div>
            );
        }
        if (!userData && !combinedLoading) {
            if (!showNotificationModal) {
                 return (
                    <div className="text-center p-10">
                        <p className="text-gray-400 text-lg">User not found.</p>
                    </div>
                );
            }
            return null; 
        }
        if (!userData) return null; 

        return (
            <>
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
                        User Profile
                    </h1>
                    <div className="flex items-center space-x-3">
                        {!isEditMode && canEditAnyField && ( 
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-md hover:bg-blue-500/10"
                                aria-label="Edit user"
                            >
                                <FaEdit size={18} />
                            </button>
                        )}
                        {hasPermission('reset_user_password') && (
                             <button
                                onClick={() => setShowPasswordResetModal(true)}
                                className="flex items-center text-orange-400 hover:text-orange-300 transition-colors p-2 rounded-md hover:bg-orange-500/10"
                                aria-label="Reset password"
                            >
                                <FaKey size={16} />
                            </button>
                        )}
                         {hasPermission('delete_user') && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center text-red-500 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10"
                                aria-label="Delete user"
                            >
                                <FaTrash size={18} />
                            </button>
                         )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-700">
                    <div>
                        <p className="text-sm text-gray-400">User ID</p>
                        <p className="text-lg font-semibold">{userData.uid || 'N/A'}</p> 
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-lg">{userData.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Current Role</p>
                        <p className="text-lg flex items-center">
                            <FaUserShield className="mr-2 text-blue-400" />
                            {getRoleName(userData.roleId) || 'No Role Assigned'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p className={`text-lg font-semibold ${userData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {userData.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Password</p>
                        {userData.password ? (
                            <div className="flex items-center">
                                <p className="text-lg mr-2">
                                   {showUserPassword ? 
                                        (() => {
                                            try {
                                                const staticKey = 'meriChabi'; 
                                                const decryptedBytes = CryptoJS.AES.decrypt(userData.password, staticKey);
                                                const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
                                                if (!decryptedText) {
                                                    // This handles cases where decryption results in an empty string, which can happen with malformed data.
                                                    throw new Error("Empty decryption result");
                                                }
                                                return decryptedText;
                                            } catch (e) {
                                                console.error("Decryption error:", e);
                                                return "Cannot display (invalid format)";
                                            }
                                        })()
                                        : '••••••••'
                                    }
                                </p>
                                <button 
                                    onClick={() => setShowUserPassword(!showUserPassword)}
                                    className="text-gray-400 hover:text-gray-200"
                                    aria-label={showUserPassword ? "Hide password" : "Show password"}
                                >
                                    {showUserPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        ) : (
                            <p className="text-lg text-gray-500 italic">Password not stored</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Created At</p>
                        <p className="text-sm">{userData.createdAt ? formatDateToLocal(userData.createdAt) : 'N/A'} {userData.createdAt ? `(${getTimeAgo(userData.createdAt)})` : ''}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Last Updated</p>
                        <p className="text-sm">{userData.updatedAt ? formatDateToLocal(userData.updatedAt) : 'N/A'} {userData.updatedAt ? `(${getTimeAgo(userData.updatedAt)})` : ''}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Last Login</p>
                        <p className="text-sm">{userData.lastLoginAt ? formatDateToLocal(userData.lastLoginAt) : 'N/A'} {userData.lastLoginAt ? `(${getTimeAgo(userData.lastLoginAt)})` : ''}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                    {isEditMode ? "Edit User Information" : "User Information"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                        <input type="text" name="displayName" id="displayName" value={editableData.displayName} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_details')}
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${(!isEditMode || !hasPermission('edit_user_details')) ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`} />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                        <input type="tel" name="phone" id="phone" value={editableData.phone} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_details')}
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${(!isEditMode || !hasPermission('edit_user_details')) ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`} />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                        <input type="text" name="companyName" id="companyName" value={editableData.companyName} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_details')}
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${(!isEditMode || !hasPermission('edit_user_details')) ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`} />
                    </div>
                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                        <input type="text" name="jobTitle" id="jobTitle" value={editableData.jobTitle} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_details')}
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${(!isEditMode || !hasPermission('edit_user_details')) ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                        <textarea name="bio" id="bio" rows="3" value={editableData.bio} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_details')}
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none ${(!isEditMode || !hasPermission('edit_user_details')) ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`}></textarea>
                    </div>
                    <div>
                        <label htmlFor="roleId" className="block text-sm font-medium text-gray-400 mb-1">Assign Role</label>
                        <select name="roleId" id="roleId" value={editableData.roleId} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_role') || userData.email === 'admin@example.com' }
                            className={`w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${(!isEditMode || !hasPermission('edit_user_role') || userData.email === 'admin@example.com') ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`}>
                            <option value="">Select a Role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id} disabled={role.id === 'admin' && userData.email !== 'admin@example.com' }>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center pt-6">
                        <input type="checkbox" name="isActive" id="isActive" checked={editableData.isActive} onChange={handleInputChange}
                            disabled={!isEditMode || !hasPermission('edit_user_status') || userData.email === 'admin@example.com' }
                            className={`h-5 w-5 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-400 ${(!isEditMode || !hasPermission('edit_user_status') || userData.email === 'admin@example.com') ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`} />
                        <label htmlFor="isActive" className={`ml-2 text-sm font-medium ${(!isEditMode || !hasPermission('edit_user_status') || userData.email === 'admin@example.com') ? 'text-gray-500' : 'text-gray-300'}`}>User is Active</label>
                    </div>
                </div>

                {isEditMode && (
                    <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                        <button
                            onClick={handleSaveChanges}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors duration-200"
                            aria-label="Save changes"
                            disabled={!canEditAnyField} 
                        >
                            <FaSave /> Save Changes
                        </button>
                         <button
                            onClick={() => {
                                setIsEditMode(false);
                                if(userData) {
                                    setEditableData({
                                        displayName: userData.displayName || '',
                                        phone: userData.phone || '',
                                        companyName: userData.companyName || '',
                                        jobTitle: userData.jobTitle || '',
                                        bio: userData.bio || '',
                                        roleId: userData.roleId || '',
                                        isActive: typeof userData.isActive === 'boolean' ? userData.isActive : true,
                                    });
                                }
                                clearNotifications();
                            }}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors duration-200"
                            aria-label="Cancel edit"
                        >
                           Cancel
                        </button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
             <NotificationModal
                show={showNotificationModal}
                onClose={clearNotifications}
                title={notificationTitle}
                message={notificationMessage}
                type={notificationType}
            />
            {showPasswordResetModal && userData && (
                <PasswordResetModal
                    show={showPasswordResetModal}
                    onClose={() => setShowPasswordResetModal(false)}
                    onConfirm={handlePasswordReset}
                    userDisplayName={userData.displayName || userData.email}
                />
            )}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-700 rounded-t-lg shadow-md max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-white hover:text-yellow-300 transition-colors p-2 rounded-full hover:bg-gray-600"
                    aria-label="Back to user list"
                >
                    <FaArrowLeft size={18} />
                </button>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevious}
                        disabled={!users || users.length === 0 || currentIndex <= 0}
                        className={`p-2 rounded-full transition-colors ${(!users || users.length === 0 || currentIndex <= 0) ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
                        aria-label="Previous user"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!users || users.length === 0 || currentIndex >= users.length - 1}
                        className={`p-2 rounded-full transition-colors ${(!users || users.length === 0 || currentIndex >= users.length - 1) ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-yellow-300 hover:bg-gray-600'}`}
                        aria-label="Next user"
                    >
                        <FaChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="bg-gray-800 text-gray-100 p-6 rounded-b-lg shadow-xl border border-gray-700 border-t-0 max-w-4xl mx-auto" style={{minHeight: 'calc(100vh - 120px)'}}>
                {renderContent()}
            </div>

            <DeleteConfirmModal
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteUser}
                title="Confirm User Deletion"
                message={`Are you sure you want to delete the user "${userData?.displayName || userData?.email}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default UserDetailView;