// FILE: client/src/admin/RoleManagement.jsx

import React, { useState, useEffect } from 'react';
import { FaRegEdit, FaTrash, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import { useRoleManagement } from './hooks/useRoleManagement';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import NotificationModal from './components/NotificationModal'; // Import NotificationModal
import { useAuth, ALL_APP_PERMISSIONS } from './AuthContext'; 

const RoleManagement = () => {
    const { roles, loading, error: hookErrorFromHook, addRole, updateRole, deleteRole, setError: setHookError, generateRoleIdFromName } = useRoleManagement();
    const { hasPermission } = useAuth(); 

    const [editingRoleId, setEditingRoleId] = useState(null);
    const [currentRoleData, setCurrentRoleData] = useState({ name: '', description: '', permissions: '' });
    const [newRoleData, setNewRoleData] = useState({ name: '', description: '', permissions: '' });
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [derivedNewRoleId, setDerivedNewRoleId] = useState('');
    const [derivedEditingRoleId, setDerivedEditingRoleId] = useState('');

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
    
    useEffect(() => {
        if (hookErrorFromHook) {
            displayNotification('Error', hookErrorFromHook, 'error');
        }
    }, [hookErrorFromHook]);


    useEffect(() => {
        if (newRoleData.name) {
            setDerivedNewRoleId(generateRoleIdFromName(newRoleData.name));
        } else {
            setDerivedNewRoleId('');
        }
    }, [newRoleData.name, generateRoleIdFromName]);

    useEffect(() => {
        if (editingRoleId && currentRoleData.name) {
            setDerivedEditingRoleId(generateRoleIdFromName(currentRoleData.name));
        } else {
            setDerivedEditingRoleId('');
        }
    }, [editingRoleId, currentRoleData.name, generateRoleIdFromName]);


    const handleEdit = (role) => {
        setEditingRoleId(role.id);
        const permissionsString = role.id === 'admin' 
            ? ALL_APP_PERMISSIONS.join(', ') 
            : (Array.isArray(role.permissions) ? role.permissions.join(', ') : (role.permissions || ''));
        
        setCurrentRoleData({
            name: role.name || '', 
            description: role.description || '',
            permissions: permissionsString // This string is for display and internal state
        });
        setHookError(null);
    };

    const handleCancelEdit = () => {
        setEditingRoleId(null);
        setCurrentRoleData({ name: '', description: '', permissions: '' });
        setHookError(null);
    };

    const handleSave = async () => {
        const roleName = currentRoleData.name ? currentRoleData.name.trim() : '';
        const roleDescription = currentRoleData.description ? currentRoleData.description.trim() : '';

        if (!roleName && editingRoleId !== 'admin') {
            displayNotification('Validation Error', 'Role Display Name cannot be empty.', 'error');
            return;
        }
        if (roleName.length > 50) {
            displayNotification('Validation Error', 'Role Display Name cannot exceed 50 characters.', 'error');
            return;
        }
        if (editingRoleId !== 'admin' && !generateRoleIdFromName(roleName)) { 
            displayNotification('Validation Error', 'Role Display Name must result in a valid Role ID (e.g., "content_editor" - only letters, numbers, underscores).', 'error');
            return;
        }
        if (!roleDescription) {
            displayNotification('Validation Error', 'Role Description cannot be empty.', 'error');
            return;
        }
        if (roleDescription.length > 200) { 
            displayNotification('Validation Error', 'Role Description cannot exceed 200 characters.', 'error');
            return;
        }

        setHookError(null); 

        // Permissions are sourced from currentRoleData.permissions which was set on edit
        // and is not changed by user input in this view (as per new read-only design for permissions column)
        const permissionsArray = editingRoleId === 'admin' 
            ? ALL_APP_PERMISSIONS 
            : (currentRoleData.permissions || '').split(',').map(p => p.trim()).filter(Boolean);
        
        const payload = {
            description: roleDescription, 
            permissions: permissionsArray // Pass the existing (or admin's) permissions
        };
        
        if (editingRoleId !== 'admin') {
            payload.name = roleName;
        }

        const success = await updateRole(editingRoleId, payload);
        
        if (success) {
            setEditingRoleId(null);
            displayNotification('Success', 'Role updated successfully.', 'success');
        } else {
            // Error already displayed by useEffect hook watching hookErrorFromHook or handled in updateRole
        }
    };

    const handleInputChange = (e, type) => {
        const { name, value } = e.target;
        if (type === 'edit') {
            // Prevent direct editing of permissions string if 'permissions' field is changed in future
            // For now, only name and description are directly editable by user input fields
            if (name !== 'permissions') { 
              setCurrentRoleData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setNewRoleData(prev => ({ ...prev, [name]: value }));
        }
        setHookError(null); 
    };

    const handleAddNewRole = async (e) => {
        e.preventDefault();
        setHookError(null);

        const trimmedName = newRoleData.name.trim();
        const trimmedDescription = newRoleData.description.trim();

        if (!trimmedName) {
            displayNotification('Validation Error', 'Display Name is required for a new role.', 'error');
            return;
        }
        if (!trimmedDescription) {
            displayNotification('Validation Error', 'Description is required for a new role.', 'error');
            return;
        }
        
        const roleId = generateRoleIdFromName(trimmedName);
        if (!roleId) {
            displayNotification('Validation Error', 'Display Name must result in a valid Role ID (only letters, numbers, underscores).', 'error');
            return;
        }
         if (roleId === 'admin') {
            displayNotification('Error', "Cannot create a role with the ID 'admin' as it is reserved.", 'error');
            return;
        }

        if (roles.some(role => role.id === roleId)) {
            displayNotification('Error', `A role with ID '${roleId}' (derived from name '${trimmedName}') already exists.`, 'error');
            return;
        }
        
        const permissionsArray = (newRoleData.permissions || '').split(',').map(p => p.trim()).filter(Boolean);
        
        const success = await addRole(roleId, { 
            name: trimmedName,
            description: trimmedDescription, 
            permissions: permissionsArray 
        });
        
        if(success) {
            setNewRoleData({ name: '', description: '', permissions: '' });
            setDerivedNewRoleId('');
            displayNotification('Success', 'New role added successfully.', 'success');
        } else {
           // Error already displayed by useEffect hook watching hookErrorFromHook or handled in addRole
        }
    };
    
    const handleDeleteClick = (role) => {
        if (role.id === 'admin') {
            displayNotification('Error', "The 'admin' role cannot be deleted.", 'error');
            return;
        }
        setRoleToDelete(role);
        setShowDeleteConfirm(true);
        setHookError(null);
    };

    const confirmDeleteRole = async () => {
        if (roleToDelete) {
            const success = await deleteRole(roleToDelete.id);
            if (success) {
                setShowDeleteConfirm(false);
                setRoleToDelete(null);
                displayNotification('Success', 'Role deleted successfully.', 'success');
            } else {
                // Error message will be displayed by the hookErrorFromHook effect or handled in deleteRole
                setShowDeleteConfirm(false); // Still close confirm modal on API error
            }
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-300">Loading roles...</div>;

    return (
        <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
            <NotificationModal
                show={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                title={notificationTitle}
                message={notificationMessage}
                type={notificationType}
            />
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-500">Role Management</h1>
            
            <form onSubmit={handleAddNewRole} className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">Add New Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-start">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Role Name (e.g., Content Editor)"
                            value={newRoleData.name}
                            onChange={(e) => handleInputChange(e, 'new')}
                            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        {newRoleData.name && <span className="text-xs text-gray-400 mt-1 block">Generated ID: {derivedNewRoleId || 'Invalid Name'}</span>}
                    </div>
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={newRoleData.description}
                        onChange={(e) => handleInputChange(e, 'new')}
                        className="p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                        type="text"
                        name="permissions"
                        placeholder="Permissions (comma-separated)"
                        value={newRoleData.permissions}
                        onChange={(e) => handleInputChange(e, 'new')}
                        className="p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                </div>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-md font-semibold transition-colors duration-200"
                    disabled={loading}
                >
                    <FaPlus /> Add Role
                </button>
            </form>

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Display Name (Role ID)</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Description</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Permissions</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {roles.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-400">No roles found.</td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-700/50 transition-colors duration-150">
                                    {editingRoleId === role.id ? (
                                        <>
                                            <td className="py-4 px-4">
                                                <input type="text" name="name" value={currentRoleData.name} 
                                                       onChange={(e) => handleInputChange(e, 'edit')} 
                                                       className={`w-full p-2 bg-gray-600 text-white border border-gray-500 rounded-md ${role.id === 'admin' ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}`}
                                                       disabled={role.id === 'admin'}
                                                />
                                                {role.id !== 'admin' && currentRoleData.name && <span className="text-xs text-gray-500 mt-1 block">ID will be: {derivedEditingRoleId || 'Invalid Name'}</span>}
                                            </td>
                                            <td className="py-4 px-4">
                                                <input type="text" name="description" value={currentRoleData.description} 
                                                       onChange={(e) => handleInputChange(e, 'edit')} 
                                                       className="w-full p-2 bg-gray-600 text-white border border-gray-500 rounded-md" 
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                {role.id === 'admin' ? (
                                                    <div className="p-2 bg-gray-600 border border-gray-500 rounded-md">
                                                        <span className="text-sm text-green-300 font-semibold">All Permissions Granted</span>
                                                        <span className="text-xs text-gray-400 mt-1 block">(Not editable here)</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-gray-600 border border-gray-500 rounded-md">
                                                            {(currentRoleData.permissions || '').split(',').map(p => p.trim()).filter(Boolean).length > 0 ?
                                                                (currentRoleData.permissions || '').split(',').map(p => p.trim()).filter(Boolean).map(perm => (
                                                                    <span key={perm} className="text-xs bg-gray-500 text-yellow-200 px-2 py-1 rounded-full">{perm}</span>
                                                                )) :
                                                                <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                                                            }
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-1 block">Permissions are managed in the Permission Matrix.</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <button onClick={handleSave} className="text-green-400 hover:text-green-300 p-2 rounded-md mr-2 transition-colors" title="Save" disabled={loading}><FaCheck size={18} /></button>
                                                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-200 p-2 rounded-md transition-colors" title="Cancel" disabled={loading}><FaTimes size={18} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-4 px-4 whitespace-nowrap font-medium">{role.name} <span className="text-xs text-gray-500">({role.id})</span></td>
                                            <td className="py-4 px-4">{role.description}</td>
                                            <td className="py-4 px-4">
                                                {role.id === 'admin' ? (
                                                    <span className="text-sm text-green-400 font-semibold">All Permissions Granted</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                                        {role.permissions && role.permissions.length > 0 ? 
                                                            role.permissions.map(perm => (
                                                                <span key={perm} className="text-xs bg-gray-600 text-yellow-300 px-2 py-1 rounded-full">{perm}</span>
                                                            )) : 
                                                            <span className="text-xs text-gray-500">No permissions</span>
                                                        }
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                 <button 
                                                    onClick={() => handleEdit(role)} 
                                                    className="text-blue-400 hover:text-blue-300 p-2 rounded-md mr-2 transition-colors" 
                                                    title="Edit"
                                                    disabled={loading}
                                                >
                                                    <FaRegEdit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(role)} 
                                                    className={`p-2 rounded-md transition-colors ${role.id === 'admin' ? 'text-gray-500 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
                                                    title={role.id === 'admin' ? "Admin role cannot be deleted" : "Delete"}
                                                    disabled={role.id === 'admin' || loading}
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <DeleteConfirmModal
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteRole}
                title="Confirm Role Deletion"
                message={`Are you sure you want to delete the role "${roleToDelete?.name}" (ID: ${roleToDelete?.id})? This action cannot be undone and may affect users assigned to this role.`}
            />
        </div>
    );
};

export default RoleManagement;