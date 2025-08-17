
// FILE: client/src/admin/hooks/useUserManagement.js
import { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, Timestamp, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../utils/firebase'; 
import CryptoJS from 'crypto-js';

// --- UID Generation Helpers ---
const ROLE_PREFIX_MAP = {
    admin: 'ad',
    client: 'cl',
    editor: 'ed',
    developer: 'dv',
    manager: 'pm', 
    freelancer: 'fr', 
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
        console.warn("formatDateForUID received invalid date:", dateObj, "Using current date as fallback.");
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
// --- End UID Generation Helpers ---

export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    
    useEffect(() => {
        const initializeAndListen = async () => { 
            setLoading(true);
            setError(null);
            
            const usersCollection = collection(db, 'users');
            const unsubscribe = onSnapshot(usersCollection, async (snapshot) => {
                let usersList = snapshot.docs.map(docSnap => ({
                    id: docSnap.id, 
                    ...docSnap.data(),
                    createdAt: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate() : null,
                    updatedAt: docSnap.data().updatedAt?.toDate ? docSnap.data().updatedAt.toDate() : null,
                    lastLoginAt: docSnap.data().lastLoginAt?.toDate ? docSnap.data().lastLoginAt.toDate() : null,
                }));

                const DOC_ID_MIGRATION_FLAG = 'uidDocIdMigrationCompleted_v1';
                if (!localStorage.getItem(DOC_ID_MIGRATION_FLAG)) {
                    console.log("[useUserManagement] Running Document ID migration for existing users...");
                    const migrationBatch = writeBatch(db);
                    let migrationCount = 0;
                    const allCurrentUsersForSerialCheck = [...usersList]; 

                    const usersToMigrate = usersList.filter(user => user.id.includes('@')); 

                    for (const userToMigrate of usersToMigrate) {
                        if (!userToMigrate.roleId) {
                            console.warn(`[useUserManagement] Skipping migration for user ${userToMigrate.id} due to missing roleId.`);
                            continue;
                        }

                        let maxSerialForRole = 0;
                        allCurrentUsersForSerialCheck.forEach(u => {
                            if (u.roleId === userToMigrate.roleId) {
                                const serialFromDocId = parseUIDForSerial(u.id, u.roleId);
                                if (serialFromDocId !== null && serialFromDocId > maxSerialForRole) {
                                    maxSerialForRole = serialFromDocId;
                                }
                                const serialFromUidField = parseUIDForSerial(u.uid, u.roleId);
                                 if (serialFromUidField !== null && serialFromUidField > maxSerialForRole) {
                                    maxSerialForRole = serialFromUidField;
                                }
                            }
                        });
                        const alreadyMigratedInThisBatch = usersList.filter(u => 
                            u.roleId === userToMigrate.roleId && !u.id.includes('@')
                        );
                        alreadyMigratedInThisBatch.forEach(migratedUser => {
                            const serialFromDocId = parseUIDForSerial(migratedUser.id, migratedUser.roleId);
                            if (serialFromDocId !== null && serialFromDocId > maxSerialForRole) {
                                maxSerialForRole = serialFromDocId;
                            }
                        });

                        const nextSerial = maxSerialForRole + 1;
                        const creationDate = userToMigrate.createdAt ? new Date(userToMigrate.createdAt) : new Date();
                        const newDocID = generateFinalUID(userToMigrate.roleId, nextSerial, creationDate);

                        const oldDocRef = doc(db, 'users', userToMigrate.id);
                        const newDocRef = doc(db, 'users', newDocID);

                        const userFullData = { ...userToMigrate };
                        delete userFullData.id; 
                        
                        migrationBatch.set(newDocRef, {
                            ...userFullData,
                            uid: newDocID, 
                            updatedAt: Timestamp.now(),
                            createdAt: userToMigrate.createdAt ? Timestamp.fromDate(new Date(userToMigrate.createdAt)) : Timestamp.now()
                        });
                        migrationBatch.delete(oldDocRef);
                        migrationCount++;
                        
                        const userIndex = allCurrentUsersForSerialCheck.findIndex(u => u.id === userToMigrate.id);
                        if(userIndex !== -1) {
                            allCurrentUsersForSerialCheck[userIndex] = { ...userToMigrate, id: newDocID, uid: newDocID };
                        } else {
                             allCurrentUsersForSerialCheck.push({ ...userToMigrate, id: newDocID, uid: newDocID });
                        }
                    }

                    if (migrationCount > 0) {
                        try {
                            await migrationBatch.commit();
                            console.log(`[useUserManagement] Document ID migration completed for ${migrationCount} users. Please refresh if data doesn't update immediately.`);
                        } catch (e) {
                            console.error("[useUserManagement] Error during Document ID migration batch commit:", e);
                            setError("Error migrating document IDs: " + e.message);
                        }
                    }
                    localStorage.setItem(DOC_ID_MIGRATION_FLAG, 'true');
                }

                const UID_FIELD_BACKFILL_FLAG = 'uidFieldBackfillCompleted_v2'; 
                if (!localStorage.getItem(UID_FIELD_BACKFILL_FLAG)) {
                    console.log("[useUserManagement] Running UID field backfill for existing users...");
                    const batch = writeBatch(db);
                    let updateCount = 0;
                    const allUsersForSerialCheck = [...usersList];

                    const usersNeedUidField = usersList.filter(user => {
                         const isNewFormatId = user.id && parseUIDForSerial(user.id, user.roleId) !== null;
                         const hasNewFormatUidField = user.uid && parseUIDForSerial(user.uid, user.roleId) !== null;
                         return isNewFormatId ? !hasNewFormatUidField || user.uid !== user.id : !hasNewFormatUidField;
                    });

                    for (const userToUpdate of usersNeedUidField) {
                        if (!userToUpdate.roleId) {
                            console.warn(`[useUserManagement] Skipping UID field backfill for user ${userToUpdate.id} due to missing roleId.`);
                            continue;
                        }
                        const isDocIdNewFormat = parseUIDForSerial(userToUpdate.id, userToUpdate.roleId) !== null;

                        if (isDocIdNewFormat && userToUpdate.uid !== userToUpdate.id) {
                            batch.update(doc(db, 'users', userToUpdate.id), { uid: userToUpdate.id, updatedAt: Timestamp.now() });
                            updateCount++;
                        } else if (!isDocIdNewFormat) {
                            let maxSerialForRole = 0;
                             allUsersForSerialCheck.forEach(u => {
                                if (u.roleId === userToUpdate.roleId) {
                                    const serialFromDocId = parseUIDForSerial(u.id, u.roleId);
                                    if (serialFromDocId !== null && serialFromDocId > maxSerialForRole) {
                                        maxSerialForRole = serialFromDocId;
                                    }
                                    const serialFromUidField = parseUIDForSerial(u.uid, u.roleId);
                                     if (serialFromUidField !== null && serialFromUidField > maxSerialForRole) {
                                        maxSerialForRole = serialFromUidField;
                                    }
                                }
                            });
                            const nextSerial = maxSerialForRole + 1;
                            const creationDate = userToUpdate.createdAt ? new Date(userToUpdate.createdAt) : new Date();
                            const newUIDForField = generateFinalUID(userToUpdate.roleId, nextSerial, creationDate);
                            
                            batch.update(doc(db, 'users', userToUpdate.id), { uid: newUIDForField, updatedAt: Timestamp.now() });
                            updateCount++;
                            const userIndex = allUsersForSerialCheck.findIndex(u => u.id === userToUpdate.id);
                            if(userIndex !== -1) allUsersForSerialCheck[userIndex].uid = newUIDForField;
                        }
                    }
                    if (updateCount > 0) {
                        try {
                            await batch.commit();
                            console.log(`[useUserManagement] UID field backfill completed for ${updateCount} users.`);
                        } catch (e) {
                            console.error("[useUserManagement] Error during UID field backfill batch commit:", e);
                            setError("Error during UID field backfill: " + e.message);
                        }
                    }
                    localStorage.setItem(UID_FIELD_BACKFILL_FLAG, 'true');
                }

                setUsers(usersList);
                setLoading(false);
            }, (err) => {
                console.error("[useUserManagement] Error fetching users: ", err);
                setError("Failed to fetch users.");
                setLoading(false);
            });
            return unsubscribe;
        };

        const unsubscribePromise = initializeAndListen();

        return () => {
            unsubscribePromise.then(unsub => {
                if (typeof unsub === 'function') {
                    unsub();
                }
            }).catch(err => console.error("[useUserManagement] Error cleaning up user listener:", err));
        };
    }, []); 


    const getUser = useCallback(async (userId) => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLoading(false);
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
                    lastLoginAt: data.lastLoginAt?.toDate ? data.lastLoginAt.toDate() : null,
                };
            } else {
                setError("User not found.");
                setLoading(false);
                return null;
            }
        } catch (err) {
            console.error("[useUserManagement] Error fetching user: ", err);
            setError("Failed to fetch user details.");
            setLoading(false);
            return null;
        }
    }, []);


    const addUser = useCallback(async (userData) => {
        if (!userData.email) {
            setError("User email is required.");
            return false;
        }
        if (!userData.roleId) {
            setError("User role is required for UID generation.");
            return false;
        }
        if (!userData.password) {
            setError("Password is required for new user.");
            return false;
        }
        
        try {
            setError(null);
            setLoading(true);

            const usersCollectionRef = collection(db, 'users');
            const allUsersSnapshot = await getDocs(usersCollectionRef);
            let maxSerial = 0;
            allUsersSnapshot.docs.forEach(docSnap => {
                const serialFromDocId = parseUIDForSerial(docSnap.id, userData.roleId);
                if (serialFromDocId !== null && serialFromDocId > maxSerial) {
                    maxSerial = serialFromDocId;
                }
                const userDocData = docSnap.data();
                const serialFromUidField = parseUIDForSerial(userDocData.uid, userData.roleId);
                if (serialFromUidField !== null && serialFromUidField > maxSerial) {
                    maxSerial = serialFromUidField;
                }
            });

            const nextSerial = maxSerial + 1;
            const newGeneratedUID = generateFinalUID(userData.roleId, nextSerial, new Date());

            const userRef = doc(db, 'users', newGeneratedUID); 
            const existingUserDoc = await getDoc(userRef);

            if (existingUserDoc.exists()) {
                setError(`Generated User ID ${newGeneratedUID} already exists. This might be a serial collision or duplicate attempt.`);
                console.warn(`[useUserManagement] Generated User ID ${newGeneratedUID} already exists.`);
                setLoading(false);
                return false;
            }
            
            const emailQuery = query(collection(db, 'users'), where("email", "==", userData.email));
            const emailQuerySnapshot = await getDocs(emailQuery);
            if (!emailQuerySnapshot.empty) {
                setError(`Email ${userData.email} is already in use by another user.`);
                setLoading(false);
                return false;
            }
            
            const now = Timestamp.now();
            await setDoc(userRef, {
                uid: newGeneratedUID, 
                email: userData.email,
                displayName: userData.displayName || '',
                password: userData.password, 
                photoURL: userData.photoURL || '',
                roleId: userData.roleId,
                createdAt: now,
                updatedAt: now,
                lastLoginAt: null,
                phone: userData.phone || '',
                companyName: userData.companyName || '',
                jobTitle: userData.jobTitle || '',
                bio: userData.bio || '',
                isActive: typeof userData.isActive === 'boolean' ? userData.isActive : true,
                isBlocked: false,
            });
            setLoading(false);
            return true;
        } catch (err) {
            console.error("[useUserManagement] Error adding user: ", err);
            setError("Failed to add user. " + err.message);
            setLoading(false);
            return false;
        }
    }, []); 

    const updateUser = useCallback(async (userId, updatedData) => {
        try {
            setError(null);
            const userRef = doc(db, 'users', userId);
            const dataToUpdate = { ...updatedData };

            await updateDoc(userRef, {
                ...dataToUpdate,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (err) {
            console.error("[useUserManagement] Error updating user: ", err);
            setError("Failed to update user.");
            return false;
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        try {
            setError(null);
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);
            return true;
        } catch (err) {
            console.error("[useUserManagement] Error deleting user: ", err);
            setError("Failed to delete user.");
            return false;
        }
    }, []);

    return { users, loading, error, addUser, updateUser, deleteUser, getUser, setError };
};