

import { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { ALL_APP_PERMISSIONS } from '../AuthContext'; 

export const useRoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const generateRoleIdFromName = useCallback((name) => {
        if (!name || typeof name !== 'string') return '';
        return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
    }, []);

    useEffect(() => {
        setLoading(true);
        const rolesCollectionRef = collection(db, 'roles');
        
        // One-time check to create default roles if they don't exist (for demo/setup)
        const setupDefaultRoles = async () => {
            const defaultRoles = [
                { id: 'admin', name: 'Admin', description: 'System Administrator with all permissions.', permissions: ALL_APP_PERMISSIONS },
                { id: 'client', name: 'Client', description: 'Client user with access to view their projects/tasks.', permissions: ['tasks_view_own_assigned'] },
                { id: 'developer', name: 'Developer', description: 'Software developer working on tasks.', permissions: ['tasks_view_list', 'tasks_edit_own_assigned'] },
                { id: 'editor', name: 'Editor', description: 'Content editor or reviewer.', permissions: ['tasks_view_list', 'tasks_manage_comments'] },
                { id: 'freelancer', name: 'Freelancer', description: 'External contractor.', permissions: ['tasks_view_own_assigned'] },
                { id: 'manager', name: 'Project Manager', description: 'Manages projects and tasks.', permissions: ['tasks_access_menu', 'tasks_create', 'tasks_edit_all', 'tasks_assign_users'] },
                { id: 'partner', name: 'Partner', description: 'External partner or collaborator.', permissions: ['tasks_view_list'] } 
            ];

            const batch = writeBatch(db);
            let rolesAdded = 0;
            for (const defaultRole of defaultRoles) {
                const roleRef = doc(db, 'roles', defaultRole.id);
                const docSnap = await getDoc(roleRef);
                if (!docSnap.exists()) {
                    batch.set(roleRef, { 
                        name: defaultRole.name, 
                        description: defaultRole.description, 
                        permissions: defaultRole.permissions,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                    rolesAdded++;
                }
            }
            if (rolesAdded > 0) {
                try {
                    await batch.commit();
                    console.log(`${rolesAdded} default roles created/verified.`);
                } catch (commitError) {
                    console.error("Error committing default roles batch:", commitError);
                }
            }
        };

        setupDefaultRoles().then(() => {
            const unsubscribe = onSnapshot(rolesCollectionRef, (snapshot) => {
                const rolesList = snapshot.docs.map(docSnap => {
                    const data = docSnap.data();
                    const docId = docSnap.id;
                    
                    let displayName = docId; 
                    if (data.name && typeof data.name === 'string' && data.name.trim() !== '') {
                        displayName = data.name.trim();
                    } else if (!data.name && docId !== 'admin') { 
                         console.warn(`Role with ID '${docId}' has a missing/invalid name field. Defaulting name to ID.`);
                    } else if (docId === 'admin' && !data.name) {
                        displayName = 'Admin'; 
                    }

                    let permissions = [];
                    if (docId === 'admin') {
                        permissions = ALL_APP_PERMISSIONS; 
                    } else if (Array.isArray(data.permissions)) {
                        permissions = data.permissions;
                    } else if (typeof data.permissions === 'string' && data.permissions.trim() !== '') {
                        permissions = data.permissions.split(',').map(p => p.trim()).filter(Boolean);
                    }

                    return {
                        id: docId,
                        name: displayName,
                        description: data.description || '',
                        permissions: permissions,
                        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt || null),
                        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt || null),
                    };
                });
                setRoles(rolesList);
                setLoading(false);
                setError(null);
            }, (err) => {
                console.error("Error fetching roles: ", err);
                setError("Failed to fetch roles.");
                setLoading(false);
            });
            return () => unsubscribe();
        }).catch(err => {
            console.error("Error during setupDefaultRoles:", err);
            setError("Failed to initialize roles.");
            setLoading(false);
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to run setup once then listen

    const addRole = useCallback(async (roleId, roleData) => {
        if (!roleData.name || !roleData.name.trim()) {
            setError("Role Display Name cannot be empty when adding.");
            return false;
        }
        if (!roleId) {
            setError("Role ID (derived from Display Name) cannot be empty.");
            return false;
        }
        if (roleId === 'admin') {
            setError("Cannot create a role with the ID 'admin' as it is reserved.");
            return false;
        }
        try {
            setError(null);
            const roleRef = doc(db, 'roles', roleId);
            const docSnap = await getDoc(roleRef);

            if (docSnap.exists()) {
                setError(`A role with ID '${roleId}' (derived from name '${roleData.name}') already exists.`);
                return false;
            }
            
            const permissionsArray = Array.isArray(roleData.permissions) 
                ? roleData.permissions 
                : ((typeof roleData.permissions === 'string' && roleData.permissions.trim() !== '') ? roleData.permissions.split(',').map(p => p.trim()).filter(Boolean) : []);

            await setDoc(roleRef, { 
                name: roleData.name.trim(), 
                description: (roleData.description || '').trim(), 
                permissions: permissionsArray,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (err) {
            console.error("Error adding role: ", err);
            setError("Failed to add role: " + err.message);
            return false;
        }
    }, [setError]);

    const updateRole = useCallback(async (currentDocId, newRoleDataFromForm) => {
        try {
            setError(null);
            let roleNameFromForm = null;
            let newGeneratedRoleId = currentDocId;

            if (newRoleDataFromForm.hasOwnProperty('name')) {
                if (typeof newRoleDataFromForm.name !== 'string' ) {
                    setError("Role Display Name, if provided, must be a string.");
                    return false;
                }
                roleNameFromForm = newRoleDataFromForm.name.trim();
                if (!roleNameFromForm) {
                    setError("Role Display Name, if provided, cannot be empty after trimming.");
                    return false;
                }
                newGeneratedRoleId = generateRoleIdFromName(roleNameFromForm);
                if (!newGeneratedRoleId) {
                    setError("Role Display Name must result in a valid Role ID (e.g., 'content_editor').");
                    return false;
                }
            }
            
            if (newRoleDataFromForm.hasOwnProperty('description') && !(newRoleDataFromForm.description || '').trim()){
                 setError("Role Description, if provided, cannot be empty after trimming.");
                 return false;
            }

            if (currentDocId === 'admin' && newGeneratedRoleId !== 'admin') {
                setError("The 'admin' role ID/name cannot be changed.");
                return false;
            }
            if (currentDocId !== 'admin' && newGeneratedRoleId === 'admin') {
                 setError("Cannot rename a role to 'admin' as it is a reserved ID.");
                 return false;
            }

            const currentRoleRef = doc(db, 'roles', currentDocId);
            const currentDocSnap = await getDoc(currentRoleRef);
            if (!currentDocSnap.exists()) {
                setError(`Role with ID '${currentDocId}' not found. It may have been deleted.`);
                return false;
            }
            const currentDBData = currentDocSnap.data();

            const dataToUpdate = { ...currentDBData };
            
            if (newRoleDataFromForm.hasOwnProperty('name')) {
                dataToUpdate.name = roleNameFromForm;
            }
            if (newRoleDataFromForm.hasOwnProperty('description')) {
                dataToUpdate.description = (newRoleDataFromForm.description || '').trim();
            }
            
            if (currentDocId === 'admin') {
                dataToUpdate.permissions = ALL_APP_PERMISSIONS; 
            } else if (newRoleDataFromForm.hasOwnProperty('permissions')) {
                 dataToUpdate.permissions = Array.isArray(newRoleDataFromForm.permissions)
                    ? newRoleDataFromForm.permissions
                    : ((typeof newRoleDataFromForm.permissions === 'string' && newRoleDataFromForm.permissions.trim() !== '') 
                        ? newRoleDataFromForm.permissions.split(',').map(p => p.trim()).filter(Boolean) 
                        : []);
            }
            dataToUpdate.updatedAt = Timestamp.now();

            if (currentDocId === newGeneratedRoleId) {
                await updateDoc(currentRoleRef, dataToUpdate);
            } else { 
                const newRoleRef = doc(db, 'roles', newGeneratedRoleId);
                const newDocSnap = await getDoc(newRoleRef);
                if (newDocSnap.exists()) {
                    setError(`A role with the new ID '${newGeneratedRoleId}' (derived from name '${roleNameFromForm}') already exists. Choose a different name.`);
                    return false;
                }

                const batch = writeBatch(db);
                batch.set(newRoleRef, {
                    ...dataToUpdate, 
                    createdAt: currentDBData.createdAt || Timestamp.now(), 
                });
                batch.delete(currentRoleRef);

                const usersCollectionRef = collection(db, 'users');
                const q_users = query(usersCollectionRef, where('roleId', '==', currentDocId));
                const usersSnapshot = await getDocs(q_users);
                if (!usersSnapshot.empty) {
                    usersSnapshot.docs.forEach(userDoc => {
                        batch.update(doc(db, 'users', userDoc.id), { roleId: newGeneratedRoleId });
                    });
                }
                await batch.commit();
            }
            return true;
        } catch (err) {
            console.error("Error updating role: ", err);
            setError("Failed to update role: " + err.message);
            return false;
        }
    }, [setError, generateRoleIdFromName]);

    const deleteRole = useCallback(async (roleIdToDelete) => {
        if (roleIdToDelete === 'admin') {
            setError("The 'admin' role cannot be deleted.");
            return false;
        }
        try {
            setError(null);
            const usersRef = collection(db, 'users');
            const q_users = query(usersRef, where("roleId", "==", roleIdToDelete));
            const usersSnapshot = await getDocs(q_users);

            if (!usersSnapshot.empty) {
                 const roleToDeleteData = roles.find(r => r.id === roleIdToDelete);
                 const roleNameToDisplay = roleToDeleteData ? roleToDeleteData.name : roleIdToDelete;
                 setError(`Cannot delete role '${roleNameToDisplay}'. It is currently assigned to ${usersSnapshot.size} user(s). Please reassign users before deleting.`);
                 return false;
            }

            const roleRef = doc(db, 'roles', roleIdToDelete);
            await deleteDoc(roleRef);
            return true;
        } catch (err) {
            console.error("Error deleting role: ", err);
            setError("Failed to delete role: " + err.message);
            return false;
        }
    }, [roles, setError]);

    return { roles, loading, error, addRole, updateRole, deleteRole, setError, generateRoleIdFromName };
};
