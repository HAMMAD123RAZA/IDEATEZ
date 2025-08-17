
// FILE: client/src/admin/PermissionManagement.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useRoleManagement } from './hooks/useRoleManagement'; // To get roles and update them
import { useAuth } from './AuthContext'; // Import useAuth

// --- PREDEFINED TASKS / PERMISSIONS ---
export const PREDEFINED_TASKS = [
  // --- Dashboard ---
  { menu: "Dashboard", subMenu: "Summary Cards", taskId: "dashboard_view_user_card", description: "View 'Total Users' summary card" },
  { menu: "Dashboard", subMenu: "Summary Cards", taskId: "dashboard_view_messages_card", description: "View 'Total Messages' summary card" },
  { menu: "Dashboard", subMenu: "Summary Cards", taskId: "dashboard_view_applicants_card", description: "View 'Total Applicants' summary card" },
  { menu: "Dashboard", subMenu: "Analytics Graphs", taskId: "dashboard_view_message_analytics", description: "View 'Message Analytics' graph" },
  { menu: "Dashboard", subMenu: "Analytics Graphs", taskId: "dashboard_view_applicant_analytics", description: "View 'Applicant Analytics' graph" },
  { menu: "Dashboard", subMenu: "Analytics Graphs", taskId: "dashboard_view_user_analytics", description: "View 'User Status Analytics' graph" },

  // --- Messages ---
  { menu: "Messages", taskId: "messages_view_list", description: "View the list of incoming messages/requests" },
  { menu: "Messages", taskId: "messages_view_detail", description: "View the full details of a message" },
  { menu: "Messages", taskId: "edit_message_status", description: "Mark messages as read or unread" },
  { menu: "Messages", taskId: "delete_message", description: "Delete a message" },
  { menu: "Messages", taskId: "messages_reply_message", description: "Reply to a message (e.g., via email link)" },

  // --- Applicants ---
  { menu: "Applicants", taskId: "view_applicants_list", description: "View the list of job applicants" },
  { menu: "Applicants", taskId: "view_applicant_details", description: "View the full details of an applicant" },
  { menu: "Applicants", taskId: "edit_applicant_status", description: "Update the status of an applicant (e.g., shortlist, reject)" },
  { menu: "Applicants", taskId: "delete_applicant", description: "Delete an applicant's record" },

  // --- Task Management ---
  { menu: "Task Management", taskId: "tasks_view_dashboard", description: "Access the task dashboard and statistics" },
  { menu: "Task Management", taskId: "tasks_view_list", description: "View list of all tasks" },
  { menu: "Task Management", taskId: "tasks_view_own_assigned", description: "View tasks assigned to self" },
  { menu: "Task Management", taskId: "tasks_view_details", description: "View full details of any task" },
  { menu: "Task Management", taskId: "tasks_create", description: "Create new tasks and projects" },
  { menu: "Task Management", taskId: "tasks_edit_all", description: "Edit any task's details, status, priority, due date" },
  { menu: "Task Management", taskId: "tasks_edit_own_assigned", description: "Edit details of tasks assigned to self (limited)" },
  { menu: "Task Management", taskId: "tasks_delete_all", description: "Delete any task or project" },
  { menu: "Task Management", taskId: "tasks_delete_own", description: "Delete own created/assigned tasks" },
  { menu: "Task Management", taskId: "tasks_assign_users", description: "Assign/reassign users to tasks" },
  { menu: "Task Management", taskId: "tasks_manage_comments", description: "Add comments on tasks" },
  { menu: "Task Management", taskId: "tasks_delete_comment", description: "Delete comments on tasks" },
  { menu: "Task Management", taskId: "tasks_manage_files", description: "Upload/delete files for tasks" },
  
  // --- Settings > User Management ---
  { menu: "Settings", subMenu: "User Management", taskId: "view_users_list", description: "View the list of system users" },
  { menu: "Settings", subMenu: "User Management", taskId: "view_user_details", description: "View the profile details of a user" },
  { menu: "Settings", subMenu: "User Management", taskId: "add_user", description: "Create new system users" }, 
  { menu: "Settings", subMenu: "User Management", taskId: "edit_user_details", description: "Edit user profile details (name, phone, etc.)" }, 
  { menu: "Settings", subMenu: "User Management", taskId: "edit_user_role", description: "Assign roles to users" }, 
  { menu: "Settings", subMenu: "User Management", taskId: "edit_user_status", description: "Activate or deactivate user accounts" }, 
  { menu: "Settings", subMenu: "User Management", taskId: "delete_user", description: "Delete a user account" }, 
  { menu: "Settings", subMenu: "User Management", taskId: "reset_user_password", description: "Reset a user's password" },
  
  // --- Settings > Role Definitions ---
  { menu: "Settings", subMenu: "Role Management", taskId: "view_roles_list", description: "View the list of roles" }, 
  { menu: "Settings", subMenu: "Role Management", taskId: "add_role", description: "Add new roles" }, 
  { menu: "Settings", subMenu: "Role Management", taskId: "edit_role_name_description", description: "Edit role name and description" }, 
  { menu: "Settings", subMenu: "Role Management", taskId: "delete_role", description: "Delete roles" }, 

  // --- Settings > Permission Matrix ---
  { menu: "Settings", subMenu: "Permissions Management", taskId: "edit_role_permissions", description: "Manage permissions for roles" },
];
// --- END PREDEFINED TASKS ---

const GroupHeaderCheckbox = ({ role, tasksInGroup, onToggleGroup, hasPermission }) => {
    const groupTaskIds = tasksInGroup.map(t => t.taskId);
    const rolePermissions = role.permissions || [];
    const enabledTaskCount = groupTaskIds.filter(id => rolePermissions.includes(id)).length;

    const isChecked = enabledTaskCount === groupTaskIds.length;
    const isIndeterminate = enabledTaskCount > 0 && enabledTaskCount < groupTaskIds.length;

    const checkboxRef = useRef();

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const isDisabled = role.id === 'admin' || !hasPermission;

    return (
        <input
            ref={checkboxRef}
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => onToggleGroup(role.id, groupTaskIds, isChecked)}
            className={`form-checkbox h-4 w-4 rounded focus:ring-offset-gray-800
                        ${isDisabled 
                            ? 'text-gray-500 bg-gray-600 cursor-not-allowed border-gray-500' 
                            : 'text-yellow-500 bg-gray-600 border-gray-500 hover:bg-gray-500 focus:ring-yellow-400 cursor-pointer'
                        }`}
            aria-label={`Toggle all permissions for this group for role ${role.name}`}
        />
    );
};


const PermissionManagement = () => {
    const { roles, loading: rolesLoading, error: rolesErrorHook, updateRole, setError: setRoleHookError } = useRoleManagement();
    const { hasPermission: authHasPermission } = useAuth(); 

    const [formError, setFormError] = useState('');

    const groupedTasks = useMemo(() => {
        const groups = {};
        PREDEFINED_TASKS.forEach(task => {
            const menuKey = task.subMenu ? `${task.menu} > ${task.subMenu}` : task.menu;
            if (!groups[menuKey]) {
                groups[menuKey] = [];
            }
            groups[menuKey].push(task);
        });
        
        const menuOrder = [
            "Dashboard",
            "Dashboard > Summary Cards",
            "Dashboard > Analytics Graphs",
            "Messages",
            "Applicants",
            "Task Management",
            "Settings",
            "Settings > User Management",
            "Settings > Role Management",
            "Settings > Permissions Management"
        ];
        
        const orderedGroups = {};
        menuOrder.forEach(key => {
            if (groups[key]) {
                orderedGroups[key] = groups[key].sort((a, b) => a.description.localeCompare(b.description));
            }
        });

        Object.keys(groups).forEach(key => {
            if (!orderedGroups[key]) {
                orderedGroups[key] = groups[key].sort((a, b) => a.description.localeCompare(b.description));
            }
        });

        return orderedGroups;
    }, []);

    const handlePermissionToggle = async (roleId, taskId, isChecked) => {
        if (!authHasPermission('edit_role_permissions')) { 
            setFormError("You do not have permission to modify role permissions.");
            return;
        }

        setFormError('');
        setRoleHookError(null);

        const roleToUpdate = roles.find(r => r.id === roleId);
        if (!roleToUpdate) {
            setFormError(`Role with ID ${roleId} not found.`);
            return;
        }
        
        const currentPermissions = roleToUpdate.permissions || [];
        const newPermissions = isChecked
            ? currentPermissions.filter(p => p !== taskId)
            : [...currentPermissions, taskId];
        
        const success = await updateRole(roleId, { permissions: newPermissions });

        if (!success && rolesErrorHook) { 
            setFormError(rolesErrorHook);
        } else if (!success) {
            setFormError("Failed to update permissions. Please try again.");
        }
    };

    const handleGroupToggle = async (roleId, taskIdsInGroup, allAreChecked) => {
        if (!authHasPermission('edit_role_permissions')) { 
            setFormError("You do not have permission to modify role permissions.");
            return;
        }
        setFormError('');
        setRoleHookError(null);

        const roleToUpdate = roles.find(r => r.id === roleId);
        if (!roleToUpdate) {
            setFormError(`Role with ID ${roleId} not found.`);
            return;
        }

        const currentPermissions = new Set(roleToUpdate.permissions || []);
        if (allAreChecked) {
            // Remove all from this group
            taskIdsInGroup.forEach(id => currentPermissions.delete(id));
        } else {
            // Add all from this group
            taskIdsInGroup.forEach(id => currentPermissions.add(id));
        }
        
        const success = await updateRole(roleId, { permissions: Array.from(currentPermissions) });
        if (!success && rolesErrorHook) {
            setFormError(rolesErrorHook);
        } else if (!success) {
            setFormError("Failed to update group permissions. Please try again.");
        }
    };
    
    const loading = rolesLoading;
    const errorDisplay = formError || rolesErrorHook; 

    const THEAD_HEIGHT_CLASS = "top-0"; 

    if (loading) return <div className="p-6 text-center text-gray-300">Loading roles and permissions matrix...</div>;
    
    return (
        <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-500">Permission Matrix</h1>
          
            {errorDisplay && <p className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-md border border-red-600 flex items-center"><FaExclamationTriangle className="mr-2"/>{errorDisplay}</p>}

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
                <table className="min-w-full divide-y divide-gray-700 relative border-collapse">
                    <thead className="bg-gray-700 sticky top-0 z-20">
                        <tr>
                            <th className="py-3.5 px-4 text-left text-sm font-semibold text-yellow-400 uppercase tracking-wider sticky left-0 bg-gray-700 z-30">Task / Feature</th>
                            {roles.sort((a,b) => a.name.localeCompare(b.name)).map(role => (
                                <th key={role.id} className="py-3.5 px-4 text-center text-sm font-semibold text-yellow-400 uppercase tracking-wider whitespace-nowrap">
                                    {role.name}
                                    {role.id === 'admin' && <span className="block text-xs text-yellow-600 normal-case">(Full Access)</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {Object.entries(groupedTasks).flatMap(([menuKey, tasks]) => {
                            const isSubMenu = menuKey.includes('>');
                            return [
                                <tr key={menuKey} className="border-t-0">
                                    <td colSpan={1} className={`py-3 px-4 text-yellow-300 font-semibold sticky left-0 bg-gray-700 z-10 ${isSubMenu ? 'text-md pl-8' : 'text-lg'}`}>
                                        {menuKey}
                                    </td>
                                    {isSubMenu && roles.sort((a,b) => a.name.localeCompare(b.name)).map(role => (
                                        <td key={`${role.id}-group`} className="py-3 px-4 text-center align-middle bg-gray-700 z-10">
                                            <GroupHeaderCheckbox 
                                                role={role}
                                                tasksInGroup={tasks}
                                                onToggleGroup={handleGroupToggle}
                                                hasPermission={authHasPermission('edit_role_permissions')}
                                            />
                                        </td>
                                    ))}
                                    {!isSubMenu && <td colSpan={roles.length} className="bg-gray-700 z-10"></td>}
                                </tr>,
                                ...tasks.map(task => (
                                    <tr key={task.taskId} className="hover:bg-gray-700/30 transition-colors duration-150 group">
                                        <td className="py-3 px-4 text-sm text-gray-300 group-hover:text-yellow-200 sticky left-0 bg-gray-800 group-hover:bg-gray-700/40 z-10" title={`ID: ${task.taskId}`}>
                                            {task.description}
                                        </td>
                                        {roles.sort((a,b) => a.name.localeCompare(b.name)).map(role => {
                                            const currentPermissions = Array.isArray(role.permissions) ? role.permissions : [];
                                            const isChecked = role.id === 'admin' || currentPermissions.includes(task.taskId);
                                            const isDisabled = role.id === 'admin' || !authHasPermission('edit_role_permissions');

                                            return (
                                                <td key={`${role.id}-${task.taskId}`} className="py-3 px-4 text-center align-middle">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isDisabled}
                                                        onChange={() => handlePermissionToggle(role.id, task.taskId, isChecked)}
                                                        className={`form-checkbox h-4 w-4 rounded focus:ring-offset-gray-800 
                                                                    ${isDisabled 
                                                                        ? 'text-gray-500 bg-gray-600 cursor-not-allowed border-gray-500' 
                                                                        : 'text-yellow-500 bg-gray-600 border-gray-500 hover:bg-gray-500 focus:ring-yellow-400 cursor-pointer'
                                                                    }`}
                                                        aria-label={`Permission for ${task.description} for role ${role.name}`}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ]
                        })}
                        {roles.length === 0 && (
                            <tr>
                                <td colSpan={roles.length + 1} className="text-center py-10 text-gray-500">No roles found. Please create roles in Role Management first.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PermissionManagement;
