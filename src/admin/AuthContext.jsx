

// FILE: client/src/admin/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs, writeBatch, setDoc, Timestamp, updateDoc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../utils/firebase'; 
import CryptoJS from 'crypto-js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const ALL_APP_PERMISSIONS = [
    'add_role',
    'add_user',
    'dashboard_view_applicant_analytics',
    'dashboard_view_applicants_card',
    'dashboard_view_message_analytics',
    'dashboard_view_messages_card',
    'dashboard_view_user_analytics',
    'dashboard_view_user_card',
    'delete_applicant',
    'delete_message',
    'delete_role',
    'delete_user',
    'edit_applicant_status',
    'edit_message_status',
    'edit_role_name_description',
    'edit_role_permissions',
    'edit_user_details',
    'edit_user_role',
    'edit_user_status',
    'messages_reply_message',
    'messages_view_detail',
    'messages_view_list',
    'reset_user_password',
    'tasks_assign_users',
    'tasks_create',
    'tasks_delete_all',
    'tasks_delete_comment',
    'tasks_delete_own',
    'tasks_edit_all',
    'tasks_edit_own_assigned',
    'tasks_manage_comments',
    'tasks_manage_files',
    'tasks_view_dashboard',
    'tasks_view_details',
    'tasks_view_list',
    'tasks_view_own_assigned',
    'view_applicant_details',
    'view_applicants_list',
    'view_roles_list',
    'view_user_details',
    'view_users_list'
].sort();


// --- UID Generation Helpers (moved from useUserManagement) ---
const ROLE_PREFIX_MAP = {
    admin: 'ad', client: 'cl', editor: 'ed', developer: 'dv', manager: 'pm', freelancer: 'fr',
};
const getRolePrefix = (roleId) => {
    if (!roleId) return 'ge';
    const roleIdLower = roleId.toLowerCase();
    const specificPrefix = ROLE_PREFIX_MAP[roleIdLower];
    if (specificPrefix) return specificPrefix;
    const cleanRoleId = roleIdLower.replace(/[^a-z]/g, '');
    return cleanRoleId.length >= 2 ? cleanRoleId.substring(0, 2) : 'ge';
};
const formatDateForUID = (dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        dateObj = new Date();
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
};
const generateFinalUID = (roleId, serialNumber, dateObj) => {
    const prefix = getRolePrefix(roleId);
    const formattedDate = formatDateForUID(dateObj);
    return `${prefix}${serialNumber}${formattedDate}`;
};
const parseUIDForSerial = (uidString, roleId) => {
    if (!uidString || !roleId || typeof uidString !== 'string' || typeof roleId !== 'string') return null;
    const prefix = getRolePrefix(roleId);
    if (uidString.startsWith(prefix) && uidString.length > prefix.length + 6) {
        const serialAndDatePart = uidString.substring(prefix.length);
        const serialPartMatch = serialAndDatePart.match(/^(\d+)\d{6}$/);
        if (serialPartMatch && serialPartMatch[1]) {
            const serial = parseInt(serialPartMatch[1], 10);
            if (!isNaN(serial)) {
                return serial;
            }
        }
    }
    return null;
};
// --- End UID Generation Helpers ---

// The key is a permission that DEPENDS ON the permissions in its array value.
const PERMISSION_DEPENDENCIES = {
    // Messages
    messages_reply_message: ['messages_view_detail'],
    messages_view_detail: ['messages_view_list'],
    delete_message: ['messages_view_list'],
    edit_message_status: ['messages_view_list'],
  
    // Applicants
    view_applicant_details: ['view_applicants_list'],
    edit_applicant_status: ['view_applicant_details'],
    delete_applicant: ['view_applicants_list'],
  
    // User Management
    view_user_details: ['view_users_list'],
    add_user: ['view_users_list'],
    edit_user_details: ['view_user_details'],
    edit_user_role: ['view_user_details'],
    edit_user_status: ['view_user_details'],
    reset_user_password: ['view_user_details'],
    delete_user: ['view_users_list'],
  
    // Role Management
    add_role: ['view_roles_list'],
    edit_role_name_description: ['view_roles_list'],
    delete_role: ['view_roles_list'],
    edit_role_permissions: ['view_roles_list'], // To see matrix, must see roles.
  
    // Task Management
    tasks_view_details: ['tasks_view_list'],
    tasks_edit_all: ['tasks_view_details'],
    tasks_assign_users: ['tasks_view_details'],
    tasks_manage_comments: ['tasks_view_details'],
    tasks_delete_comment: ['tasks_view_details'],
    tasks_manage_files: ['tasks_view_details'],
    tasks_create: ['tasks_view_list'],
    tasks_delete_all: ['tasks_view_list'],
    tasks_edit_own_assigned: ['tasks_view_own_assigned'],
    tasks_delete_own: ['tasks_view_own_assigned'],
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const setupDefaults = useCallback(async () => {
        const adminRoleRef = doc(db, 'roles', 'admin');
        try {
            const adminRoleSnap = await getDoc(adminRoleRef);
            if (!adminRoleSnap.exists()) {
                await setDoc(adminRoleRef, {
                    name: "Admin",
                    description: "System Administrator with all permissions.",
                    permissions: ALL_APP_PERMISSIONS,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                });
            }
        } catch (roleErr) {
            console.error("[AuthContext] Error ensuring admin role:", roleErr);
        }

        const adminEmail = "admin@example.com";
        const adminRole = 'admin';
        const usersQuery = query(collection(db, 'users'), where('email', '==', adminEmail));

        try {
            const querySnapshot = await getDocs(usersQuery);
            const staticKey = 'meriChabi';
            const encryptedPassword = CryptoJS.AES.encrypt("admin", staticKey).toString();

            if (querySnapshot.empty) {
                console.log(`[AuthContext] Default admin user '${adminEmail}' not found. Creating...`);
                
                const allUsersSnapshotForSerial = await getDocs(collection(db, 'users'));
                let maxSerial = 0;
                allUsersSnapshotForSerial.docs.forEach(docSnap => {
                    const serialFromDocId = parseUIDForSerial(docSnap.id, adminRole);
                    if (serialFromDocId !== null && serialFromDocId > maxSerial) maxSerial = serialFromDocId;
                    const serialFromUidField = parseUIDForSerial(docSnap.data().uid, adminRole);
                    if (serialFromUidField !== null && serialFromUidField > maxSerial) maxSerial = serialFromUidField;
                });
                const nextSerial = maxSerial + 1;
                const newGeneratedUID = generateFinalUID(adminRole, nextSerial, new Date());
                const adminUserRef = doc(db, 'users', newGeneratedUID);
                const now = Timestamp.now();

                await setDoc(adminUserRef, {
                    uid: newGeneratedUID, email: adminEmail, displayName: 'Default Admin',
                    password: encryptedPassword, photoURL: '', roleId: adminRole, createdAt: now,
                    updatedAt: now, lastLoginAt: null, phone: '', companyName: 'Admin Corp',
                    jobTitle: 'Administrator', bio: 'Default system administrator.',
                    isActive: true, isBlocked: false,
                });
            } else {
                const adminDoc = querySnapshot.docs[0];
                const adminData = adminDoc.data();
                if (adminData.password !== encryptedPassword) {
                     console.log("[AuthContext] Admin user password mismatch. Updating password...");
                     await updateDoc(adminDoc.ref, { password: encryptedPassword, updatedAt: Timestamp.now() });
                }
            }
        } catch (err) {
            console.error("[AuthContext] Error ensuring default admin user:", err);
            setAuthError("Failed to initialize default admin account.");
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setCurrentUser(null);
    }, []);

    const login = useCallback(async (email, password, rememberMe) => {
        setLoading(true);
        setAuthError(null);

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Invalid email or password');
            }

            let userFound = false;
            let userDataFromDB = null;
            let userDocID = null;

            for (const docSnap of querySnapshot.docs) {
                const tempUserData = docSnap.data();
                const staticKey = 'meriChabi';
                try {
                    const decryptedBytes = CryptoJS.AES.decrypt(tempUserData.password, staticKey);
                    const decryptedStoredPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

                    if (decryptedStoredPassword === password) {
                        userFound = true;
                        userDataFromDB = tempUserData;
                        userDocID = docSnap.id;
                        break;
                    }
                } catch (decryptError) {
                    console.error("Password decryption failed for user:", tempUserData.email);
                }
            }

            if (!userFound || !userDataFromDB) {
                throw new Error('Invalid email or password');
            }

            if (userDataFromDB.isActive === false) {
                throw new Error('Your account is inactive. Please contact support.');
            }

            const userToStore = { id: userDocID, ...userDataFromDB };
            setCurrentUser(userToStore); // Set user, permissions will be attached by the listener effect

            const storage = rememberMe ? localStorage : sessionStorage;
            // Store user data without permissions initially. The listener will add them.
            storage.setItem('user', JSON.stringify(userToStore)); 
            
            await updateDoc(doc(db, 'users', userDocID), { lastLoginAt: Timestamp.now() });

        } catch (err) {
            setAuthError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for initial session loading
    useEffect(() => {
        const checkSession = async () => {
            setLoading(true);
            await setupDefaults();

            const storedUserStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUserStr) {
                try {
                    const storedUser = JSON.parse(storedUserStr);
                    const userRef = doc(db, 'users', storedUser.id);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists() && userSnap.data().isActive) {
                        // Set user data, permissions will be attached by the next effect.
                        setCurrentUser({ id: userSnap.id, ...userSnap.data() });
                    } else {
                        logout();
                    }
                } catch (err) {
                    console.error("Error re-validating session:", err);
                    logout();
                }
            }
            setLoading(false);
        };

        checkSession();
    }, [setupDefaults, logout]);

    // Effect for attaching/updating permissions in real-time
    useEffect(() => {
        if (!currentUser?.id || loading) {
            return; // Don't run if there's no user or if initial load is still in progress
        }

        if (currentUser.roleId === 'admin') {
            if (!currentUser.permissions || currentUser.permissions.length !== ALL_APP_PERMISSIONS.length) {
                setCurrentUser(prevUser => ({ ...prevUser, permissions: ALL_APP_PERMISSIONS }));
            }
            return; // No listener needed for admin
        }
        
        if (!currentUser.roleId) {
            setCurrentUser(prevUser => ({ ...prevUser, permissions: [] }));
            return;
        }

        const roleRef = doc(db, 'roles', currentUser.roleId);
        const unsubscribe = onSnapshot(roleRef, (roleSnap) => {
            let newPermissions = [];
            if (roleSnap.exists()) {
                newPermissions = roleSnap.data().permissions || [];
            } else {
                console.warn(`Role '${currentUser.roleId}' not found for user '${currentUser.email}'. Assigning no permissions.`);
            }

            setCurrentUser(prevUser => {
                if (JSON.stringify(prevUser?.permissions) !== JSON.stringify(newPermissions)) {
                    const updatedUser = { ...prevUser, permissions: newPermissions };
                    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
                    if (storage.getItem('user')) {
                        storage.setItem('user', JSON.stringify(updatedUser));
                    }
                    return updatedUser;
                }
                return prevUser;
            });
        }, (error) => {
            console.error(`Error listening to role '${currentUser.roleId}':`, error);
            setCurrentUser(prevUser => ({ ...prevUser, permissions: [] }));
        });

        return () => unsubscribe();
    }, [currentUser?.id, currentUser?.roleId, loading]);

    const checkDependency = useCallback((userPermission, requiredPermission, visited = new Set()) => {
      if (userPermission === requiredPermission) return true;
      if (visited.has(userPermission)) return false;
      visited.add(userPermission);
  
      const dependencies = PERMISSION_DEPENDENCIES[userPermission];
      if (dependencies) {
        for (const dep of dependencies) {
          if (checkDependency(dep, requiredPermission, visited)) {
            return true;
          }
        }
      }
      return false;
    }, []);

    const hasPermission = useCallback((requiredPermission) => {
        if (loading) return false;
        if (currentUser?.roleId === 'admin') return true;
        const userPermissions = currentUser?.permissions || [];
        if (userPermissions.includes(requiredPermission)) {
            return true;
        }
        // Check for implied permissions
        for (const userPermission of userPermissions) {
            if (checkDependency(userPermission, requiredPermission)) {
                return true;
            }
        }
        return false;
    }, [currentUser, loading, checkDependency]);
    
    const hasAnyPermission = useCallback((permissionKeys) => {
        if (loading) return false;
        if (currentUser?.roleId === 'admin') return true;
        if (!Array.isArray(permissionKeys)) return false;
        return permissionKeys.some(key => hasPermission(key));
    }, [currentUser, loading, hasPermission]);

    const value = {
        currentUser, login, logout, hasPermission, hasAnyPermission, loading,
        authError, refreshPermissions: () => {}
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
