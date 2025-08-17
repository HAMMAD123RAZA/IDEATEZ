
// FILE: client/src/admin/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Added collection, query, where, getDocs
import { db } from '../utils/firebase'; // Adjust path as necessary

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Configuration for simulated admin user
const SIMULATED_ADMIN_EMAIL = 'admin@example.com'; // This is the Firebase email to lookup
// const SIMULATED_ADMIN_ROLE_ID = 'admin'; // Role ID (document ID in 'roles' collection) // No longer directly used, fetched from user doc

// Define all possible permissions in the application
export const ALL_APP_PERMISSIONS = [
    'view_dashboard',
    'view_messages_list',
    'edit_message_status',
    'delete_message',
    'view_applicants_list',
    'edit_applicant_status',
    'delete_applicant',
    'view_users_list',
    'add_user',
    'edit_user_details',
    'edit_user_role',
    'edit_user_status',
    'delete_user',
    'view_user_details',
    'reset_user_password', 
    'view_roles_list',
    'add_role',
    'edit_role_name_description',
    'edit_role_permissions',
    'delete_role',
    'settings_access_menu', 
    'dashboard_access_menu', 
    'messages_access_menu',
    'users_access_menu',
    'roles_access_menu',
    'applicants_access_menu',
    'permissions_access_menu',
    // Task Management Permissions
    'tasks_access_menu',
    'tasks_view_list',
    'tasks_view_own_assigned',
    'tasks_view_details',
    'tasks_create',
    'tasks_edit_all',
    'tasks_edit_own_assigned',
    'tasks_delete_all',
    'tasks_delete_own',
    'tasks_assign_users',
    'tasks_manage_comments',
    'tasks_delete_comment', 
    'tasks_manage_files',
    'tasks_view_dashboard'
];


export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]); 
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [authError, setAuthError] = useState(null);

    const fetchUserDataAndRole = useCallback(async () => {
        console.log('[AuthContext] DEV_MODE: Starting to fetch user data and role...');
        setLoadingPermissions(true);
        setAuthError(null);
        setUserPermissions([]); 

        try {
            // Query for the user by email
            const usersCollectionRef = collection(db, 'users');
            const userQuery = query(usersCollectionRef, where('email', '==', SIMULATED_ADMIN_EMAIL));
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.empty) {
                console.error(`[AuthContext] DEV_MODE: Simulated admin user with email '${SIMULATED_ADMIN_EMAIL}' not found in 'users' collection.`);
                setAuthError(`Admin user with email '${SIMULATED_ADMIN_EMAIL}' not found. Ensure this user exists.`);
                setCurrentUser(null);
                setLoadingPermissions(false);
                return;
            }
            
            // Assuming email is unique, take the first result
            const userDocSnap = userQuerySnapshot.docs[0];
            const userData = { id: userDocSnap.id, ...userDocSnap.data() }; // id is the document ID (UID)
            console.log('[AuthContext] DEV_MODE: Simulated user found:', userData);
            
            const effectiveRoleId = userData.roleId; 
            console.log(`[AuthContext] DEV_MODE: Effective roleId for ${SIMULATED_ADMIN_EMAIL}: ${effectiveRoleId}`);

            if (!effectiveRoleId) {
                 console.error(`[AuthContext] DEV_MODE: User ${SIMULATED_ADMIN_EMAIL} (doc ID: ${userData.id}) does not have a roleId assigned.`);
                 setAuthError(`User ${SIMULATED_ADMIN_EMAIL} has no role assigned.`);
                 setCurrentUser({ ...userData, permissions: [] });
                 setLoadingPermissions(false);
                 return;
            }


            if (effectiveRoleId === 'admin') {
                console.log('[AuthContext] DEV_MODE: Admin role detected. Setting all app permissions for currentUser state.');
                setUserPermissions(ALL_APP_PERMISSIONS);
                setCurrentUser({ 
                    ...userData, 
                    role: { id: 'admin', name: 'Administrator (Simulated)', permissions: ALL_APP_PERMISSIONS },
                    permissions: ALL_APP_PERMISSIONS 
                });
            } else {
                console.log(`[AuthContext] DEV_MODE: Non-admin role '${effectiveRoleId}' detected. Fetching role details...`);
                const roleRef = doc(db, 'roles', effectiveRoleId);
                const roleSnap = await getDoc(roleRef);

                let actualPermissions = [];
                if (roleSnap.exists()) {
                    const roleData = roleSnap.data();
                    console.log(`[AuthContext] DEV_MODE: Role '${effectiveRoleId}' found:`, roleData);
                    
                    let rawPermissions = roleData.permissions;
                    if (Array.isArray(rawPermissions)) {
                        actualPermissions = rawPermissions.map(p => p.trim()).filter(Boolean);
                    } else if (typeof rawPermissions === 'string') {
                        actualPermissions = rawPermissions.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
                    }
                    setUserPermissions(actualPermissions);
                    setCurrentUser({ 
                        ...userData, 
                        role: { id: roleSnap.id, ...roleData, permissions: actualPermissions }, 
                        permissions: actualPermissions 
                    });
                } else {
                    console.error(`[AuthContext] DEV_MODE: Role document with ID '${effectiveRoleId}' not found.`);
                    setAuthError(`Role '${effectiveRoleId}' not found for user ${SIMULATED_ADMIN_EMAIL}.`);
                    setCurrentUser({ ...userData, permissions: [] }); 
                }
            }
        } catch (error) {
            console.error("[AuthContext] DEV_MODE: Error fetching user/role data:", error);
            setAuthError("Error fetching data: " + error.message);
            setCurrentUser(null);
        } finally {
            setLoadingPermissions(false);
            // console.log(`[AuthContext] DEV_MODE: Finished fetching. Loading permissions: ${loadingPermissions}.`);
        }
    }, []); 

    useEffect(() => {
        fetchUserDataAndRole();
    }, [fetchUserDataAndRole]);

    const hasPermission = useCallback((permissionKey) => {
        if (loadingPermissions) {
            return false; 
        }
        if (currentUser && currentUser.role && currentUser.role.id === 'admin') {
            // console.log(`[AuthContext] User is admin. Granting permission for '${permissionKey}'.`);
            return true; // Admin has all permissions
        }
        const hasPerm = currentUser?.permissions?.includes(permissionKey) || false;
        // console.log(`[AuthContext] Permission check for '${permissionKey}': ${hasPerm}. User permissions:`, currentUser?.permissions);
        return hasPerm;
    }, [currentUser, loadingPermissions]);


    const value = {
        currentUser,
        hasPermission,
        loadingPermissions,
        authError,
        refreshPermissions: fetchUserDataAndRole 
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
