
// client/src/admin/TaskManagement/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
  writeBatch, 
  where, 
  getDocs,
  runTransaction,
  arrayUnion, 
  arrayRemove,  
  getDoc
} from 'firebase/firestore';
import { db } from '../../../utils/firebase'; 

// --- ID Generation Helpers ---
const getNextId = async (type) => {
  const counterRef = doc(db, 'counters', `${type}Counter`);
  let newIdSuffix;
  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { lastId: 1 });
        newIdSuffix = 1;
      } else {
        newIdSuffix = counterDoc.data().lastId + 1;
        transaction.update(counterRef, { lastId: newIdSuffix });
      }
    });
    const prefix = type === 'project' ? 'PID-' : 'TID-';
    return `${prefix}${String(newIdSuffix).padStart(3, '0')}`;
  } catch (e) {
    console.error(`Error generating ${type} ID:`, e);
    throw new Error(`Failed to generate ${type} ID.`);
  }
};
// --- End ID Generation Helpers ---

const convertFirestoreTimestampToDate = ts => {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts.seconds && typeof ts.nanoseconds === 'number') return new Timestamp(ts.seconds, ts.nanoseconds).toDate();
  if (ts instanceof Date) return ts; // Already a Date object
  const parsedDate = new Date(ts); // Try parsing if it's a string or number
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};


export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MIGRATION_FLAG = 'projectTaskIDMigration_v1_1'; 

  useEffect(() => {
    setLoading(true);
    const tasksCollectionRef = collection(db, 'tasks');
    const q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        let tasksList = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          
          let taskTitle = '';
          let projectName = '';

          if (data.isProject) {
            projectName = (data.name || data.title || '').trim();
            if (!projectName) projectName = "Untitled Project";
          } else {
            taskTitle = (data.title || data.name || '').trim();
            if (!taskTitle) taskTitle = "Untitled Task";
          }
          
          return {
            id: docSnap.id, 
            ...data,
            name: data.isProject ? projectName : undefined,
            title: !data.isProject ? taskTitle : undefined,
            isProject: data.isProject || false,
            projectId: data.projectId || null,
            clientId: data.clientId || null,
            clientName: data.clientName || '',
            subTaskIds: data.subTaskIds || [],
            dueDate: convertFirestoreTimestampToDate(data.dueDate),
            startDate: convertFirestoreTimestampToDate(data.startDate),
            createdAt: convertFirestoreTimestampToDate(data.createdAt),
            updatedAt: convertFirestoreTimestampToDate(data.updatedAt),
            comments: (data.comments || []).map(comment => ({
              ...comment,
              timestamp: convertFirestoreTimestampToDate(comment.timestamp),
            })).sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)),
            files: (data.files || []).map(file => ({
                ...file,
                timestamp: convertFirestoreTimestampToDate(file.timestamp),
                fullPath: file.fullPath || null, 
                base64Data: file.base64Data || file.data, 
                uniqueKey: file.uniqueKey || (file.name || `file_${Date.now()}`) + (file.timestamp?.seconds || Date.now()) + Math.random()
            })),
            assignedTo: Array.isArray(data.assignedTo) ? data.assignedTo : (data.assignedTo ? [data.assignedTo] : []),
          };
        });

        if (!localStorage.getItem(MIGRATION_FLAG)) {
          console.log("Starting Project/Task ID migration (v1.1)...");
          const batch = writeBatch(db);
          const oldToNewIdMapping = {};
          let migrationOpsCount = 0;

          const itemsToMigrate = tasksList.filter(t => !t.id.startsWith('PID-') && !t.id.startsWith('TID-'));
          const projectsToMigrate = itemsToMigrate.filter(t => t.isProject);
          const tasksToMigrateOnly = itemsToMigrate.filter(t => !t.isProject);

          for (const project of projectsToMigrate) {
            try {
              const newPID = await getNextId('project');
              oldToNewIdMapping[project.id] = newPID;

              const projectData = { ...project };
              const oldFirebaseId = project.id; 
              delete projectData.id;      
              projectData.id = newPID;    
              
              projectData.name = (project.name || project.title || "Untitled Project").trim();
              if (!projectData.name) projectData.name = "Untitled Project";
              delete projectData.title; 

              projectData.updatedAt = Timestamp.now();
              projectData.createdAt = project.createdAt ? Timestamp.fromDate(new Date(project.createdAt)) : Timestamp.now();
              projectData.dueDate = project.dueDate ? Timestamp.fromDate(new Date(project.dueDate)) : null;
              projectData.startDate = project.startDate ? Timestamp.fromDate(new Date(project.startDate)) : null;
              projectData.comments = (project.comments || []).map(c => ({...c, timestamp: c.timestamp ? Timestamp.fromDate(new Date(c.timestamp)) : Timestamp.now() }));
              projectData.files = (project.files || []).map(f => ({...f, base64Data: f.base64Data || f.data, timestamp: f.timestamp ? Timestamp.fromDate(new Date(f.timestamp)) : Timestamp.now() }));


              const newProjectRef = doc(db, 'tasks', newPID);
              batch.set(newProjectRef, projectData);
              batch.delete(doc(db, 'tasks', oldFirebaseId));
              migrationOpsCount +=2;
              console.log(`Migrating project ${oldFirebaseId} to ${newPID}`);
            } catch (e) {
              console.error(`Error migrating project ${project.id}:`, e);
            }
          }
          
          for (const task of tasksToMigrateOnly) {
            try {
              const newTID = await getNextId('task');
              oldToNewIdMapping[task.id] = newTID; 
              const taskData = { ...task };
              const oldFirebaseId = task.id;
              delete taskData.id; 
              taskData.id = newTID; 

              taskData.title = (task.title || task.name || "Untitled Task").trim();
              if (!taskData.title) taskData.title = "Untitled Task";
              delete taskData.name; 

              taskData.updatedAt = Timestamp.now();
              taskData.createdAt = task.createdAt ? Timestamp.fromDate(new Date(task.createdAt)) : Timestamp.now();
              taskData.dueDate = task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null;
              taskData.startDate = task.startDate ? Timestamp.fromDate(new Date(task.startDate)) : null;
              taskData.comments = (task.comments || []).map(c => ({...c, timestamp: c.timestamp ? Timestamp.fromDate(new Date(c.timestamp)) : Timestamp.now() }));
              taskData.files = (task.files || []).map(f => ({...f, base64Data: f.base64Data || f.data, timestamp: f.timestamp ? Timestamp.fromDate(new Date(f.timestamp)) : Timestamp.now() }));


              if (taskData.projectId && oldToNewIdMapping[taskData.projectId]) {
                taskData.projectId = oldToNewIdMapping[taskData.projectId];
              }
              
              const newTaskRef = doc(db, 'tasks', newTID);
              batch.set(newTaskRef, taskData);
              batch.delete(doc(db, 'tasks', oldFirebaseId));
              migrationOpsCount +=2;
              console.log(`Migrating task ${oldFirebaseId} to ${newTID}`);
            } catch (e) {
              console.error(`Error migrating task ${task.id}:`, e);
            }
          }
          
          for (const oldProjectId in oldToNewIdMapping) {
            const originalItem = itemsToMigrate.find(p => p.id === oldProjectId);
            if (originalItem && originalItem.isProject) {
              const newPID = oldToNewIdMapping[oldProjectId];
              const projectDocRef = doc(db, 'tasks', newPID); 
              
              if (originalItem.subTaskIds && originalItem.subTaskIds.length > 0) {
                const newSubTaskIds = originalItem.subTaskIds
                  .map(oldSubTaskId => oldToNewIdMapping[oldSubTaskId] || oldSubTaskId) 
                  .filter(Boolean);
                
                if (newSubTaskIds.length > 0) {
                  const projectDocSnap = await getDoc(projectDocRef); 
                  if (projectDocSnap.exists()) {
                    batch.update(projectDocRef, { subTaskIds: newSubTaskIds, updatedAt: Timestamp.now() });
                    console.log(`Updating subTaskIds for project ${newPID} with ${newSubTaskIds.join(', ')}`);
                    migrationOpsCount++;
                  } else {
                     console.warn(`Project ${newPID} (migrated from ${oldProjectId}) not found for subTaskIds update.`);
                  }
                }
              }
            }
          }

          if (migrationOpsCount > 0) {
            try {
              await batch.commit();
              localStorage.setItem(MIGRATION_FLAG, 'true');
              console.log("Project/Task ID migration committed. App will refetch data.");
            } catch (e) {
              console.error("Error committing migration batch:", e);
              setError(`Migration failed: ${e.message}`);
            }
          } else {
            localStorage.setItem(MIGRATION_FLAG, 'true');
            console.log("No items found requiring ID migration, or migration already complete.");
          }
        }

        setTasks(tasksList);
        setLoading(false);
      }, 
      (err) => {
        console.error("Error fetching tasks: ", err);
        setError("Failed to fetch tasks. " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MIGRATION_FLAG]); 

  const addTask = useCallback(async (taskData, subTasksData = []) => {
    setError(null);
    
    if (taskData.isProject && (!taskData.name || !taskData.name.trim())) {
        setError("Project Name is required.");
        return null;
    }
    if (!taskData.isProject && (!taskData.title || !taskData.title.trim())) {
        setError("Task Title is required.");
        return null;
    }
    if (!taskData.clientId) {
        setError("Client selection is required.");
        return null;
    }

    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      let mainEntityId;
      const tasksCollectionRef = collection(db, 'tasks');

      if (taskData.isProject) { 
        mainEntityId = await getNextId('project');
        const projectRef = doc(tasksCollectionRef, mainEntityId);
        const projectPayload = {
            id: mainEntityId, 
            name: taskData.name.trim(), 
            description: taskData.description?.trim() || '',
            clientId: taskData.clientId,
            clientName: taskData.clientName,
            isProject: true,
            status: taskData.status || 'not-started',
            priority: taskData.priority || 'medium',
            assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
            createdAt: now,
            updatedAt: now,
            dueDate: taskData.dueDate && taskData.dueDate !== '' ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
            startDate: taskData.startDate && taskData.startDate !== '' ? Timestamp.fromDate(new Date(taskData.startDate)) : now,
            comments: [], files: taskData.files || [], 
            subTaskIds: [], 
            createdBy: taskData.createdBy || 'system_initial',
        };
        batch.set(projectRef, projectPayload);
      } else { 
        mainEntityId = await getNextId('task');
        const taskRef = doc(tasksCollectionRef, mainEntityId);
        const taskPayload = {
            id: mainEntityId, 
            title: taskData.title.trim(),
            description: taskData.description?.trim() || '',
            clientId: taskData.clientId,
            clientName: taskData.clientName,
            isProject: false,
            projectId: taskData.projectId || null, 
            status: taskData.status || 'not-started',
            priority: taskData.priority || 'medium',
            assignedTo: Array.isArray(taskData.assignedTo) ? taskData.assignedTo : [],
            createdAt: now,
            updatedAt: now,
            dueDate: taskData.dueDate && taskData.dueDate !== '' ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
            startDate: taskData.startDate && taskData.startDate !== '' ? Timestamp.fromDate(new Date(taskData.startDate)) : now,
            comments: [], files: taskData.files || [],
            createdBy: taskData.createdBy || 'system_initial',
        };
        batch.set(taskRef, taskPayload);

        // If it's a sub-task for an existing project, update the parent.
        if (taskPayload.projectId) { 
            const parentProjectRef = doc(db, 'tasks', taskPayload.projectId);
            // Note: getDoc is not allowed in writeBatch, so we do this as a separate operation or assume parent exists.
            // For safety, if using batch, you might need to ensure parentProjectRef is valid before batch.commit()
            // or handle this update separately if it's critical.
            // For now, we add it to the batch optimistically.
            batch.update(parentProjectRef, {
                subTaskIds: arrayUnion(mainEntityId), 
                updatedAt: now 
            });
        }
      }
      
      await batch.commit();
      return mainEntityId; 
    } catch (err) {
      console.error("Error adding task/project: ", err);
      setError("Failed to add task/project: " + err.message);
      return null;
    }
  }, [setError]);

  const updateTask = useCallback(async (firestoreDocId, updates) => {
    setError(null);
    if (!firestoreDocId) {
        setError("Task/Project ID is required for updates.");
        return false;
    }
    try {
      const taskRef = doc(db, 'tasks', firestoreDocId);
      const dataToUpdate = {
        ...updates, 
        updatedAt: Timestamp.now(),
      };
      
      const docSnap = await getDoc(taskRef);
      const currentIsProject = docSnap.exists() ? docSnap.data().isProject : updates.isProject;

      if (currentIsProject) {
        if (updates.hasOwnProperty('title') && typeof updates.title === 'string' && !updates.hasOwnProperty('name')) {
            dataToUpdate.name = updates.title.trim(); 
            if (!dataToUpdate.name) dataToUpdate.name = "Untitled Project";
        } else if (updates.hasOwnProperty('name') && typeof updates.name === 'string') {
            dataToUpdate.name = updates.name.trim();
            if (!dataToUpdate.name) dataToUpdate.name = "Untitled Project";
        }
        delete dataToUpdate.title;
      } else { 
        if (updates.hasOwnProperty('name') && typeof updates.name === 'string' && !updates.hasOwnProperty('title')) {
            dataToUpdate.title = updates.name.trim(); 
            if (!dataToUpdate.title) dataToUpdate.title = "Untitled Task";
        } else if (updates.hasOwnProperty('title') && typeof updates.title === 'string') {
            dataToUpdate.title = updates.title.trim();
            if (!dataToUpdate.title) dataToUpdate.title = "Untitled Task";
        }
        delete dataToUpdate.name;
      }
      
      dataToUpdate.id = firestoreDocId; 

      if (updates.hasOwnProperty('dueDate')) { 
        dataToUpdate.dueDate = updates.dueDate && updates.dueDate !== '' ? Timestamp.fromDate(new Date(updates.dueDate)) : null;
      } else if (updates.dueDate === '') {
        dataToUpdate.dueDate = null;
      }
      if (updates.hasOwnProperty('startDate')) { 
        dataToUpdate.startDate = updates.startDate && updates.startDate !== '' ? Timestamp.fromDate(new Date(updates.startDate)) : null;
      } else if (updates.startDate === '') {
         dataToUpdate.startDate = null;
      }
      
      if (updates.assignedTo && !Array.isArray(updates.assignedTo)) {
        dataToUpdate.assignedTo = [updates.assignedTo];
      } else if (updates.hasOwnProperty('assignedTo') && (updates.assignedTo === null || updates.assignedTo === undefined)) {
        dataToUpdate.assignedTo = []; 
      }

      if (dataToUpdate.files && Array.isArray(dataToUpdate.files)) {
        dataToUpdate.files = dataToUpdate.files.map(file => ({
          ...file,
          base64Data: file.base64Data || file.data, 
          timestamp: file.timestamp instanceof Date ? Timestamp.fromDate(file.timestamp) : (file.timestamp || Timestamp.now()),
          fullPath: file.fullPath || null, 
        }));
      }
      
      if (dataToUpdate.comments && Array.isArray(dataToUpdate.comments)) {
          dataToUpdate.comments = dataToUpdate.comments.map(comment => ({
              ...comment,
              timestamp: comment.timestamp instanceof Date ? Timestamp.fromDate(comment.timestamp) : (comment.timestamp || Timestamp.now())
          }));
      }
      if (dataToUpdate._filesToDeleteFromStorage) {
        delete dataToUpdate._filesToDeleteFromStorage;
      }

      await updateDoc(taskRef, dataToUpdate);
      return true;
    } catch (err) {
      console.error("Error updating task/project: ", err);
      setError("Failed to update task/project: " + err.message);
      return false;
    }
  }, [setError]);

  const deleteTask = useCallback(async (taskIdToDelete) => { 
    setError(null);
    if (!taskIdToDelete) {
        setError("Task/Project ID is required for deletion.");
        return false;
    }
    try {
        const batch = writeBatch(db);
        const taskRef = doc(db, 'tasks', taskIdToDelete);
        const taskDocSnap = await getDoc(taskRef);

        if (!taskDocSnap.exists()) {
            setError("Task/Project to delete not found.");
            return false;
        }

        const taskData = taskDocSnap.data();
        
        // If deleting a project, delete its sub-tasks
        if (taskData.isProject) {
            const subTasksQuery = query(collection(db, 'tasks'), where('projectId', '==', taskIdToDelete));
            const subTasksSnapshot = await getDocs(subTasksQuery);
            subTasksSnapshot.forEach(subTaskDoc => {
                batch.delete(doc(db, 'tasks', subTaskDoc.id));
            });
        } 
        // If deleting a sub-task, remove it from parent project's subTaskIds
        else if (taskData.projectId) {
            const parentProjectRef = doc(db, 'tasks', taskData.projectId);
            const parentSnap = await getDoc(parentProjectRef);
            if (parentSnap.exists()) {
                 batch.update(parentProjectRef, {
                    subTaskIds: arrayRemove(taskIdToDelete),
                    updatedAt: Timestamp.now() 
                });
            } else {
                 console.warn(`Parent project ${taskData.projectId} not found when trying to delete sub-task ${taskIdToDelete}.`);
            }
        }
        
        batch.delete(taskRef); // Delete the main task or project
        await batch.commit();
        return true;
    } catch (err) {
        console.error("Error deleting task/project: ", err);
        setError("Failed to delete task/project: " + err.message);
        return false;
    }
  }, [setError]);
  
  const addCommentToTask = useCallback(async (taskId, commentData) => { 
    setError(null);
    if (!taskId || !commentData || !commentData.text || !commentData.userId) {
      setError("Task ID, comment text, and user ID are required to add a comment.");
      return false;
    }
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const newComment = {
        userId: commentData.userId,
        text: commentData.text,
        timestamp: Timestamp.now(), 
      };
      await updateDoc(taskRef, {
        comments: arrayUnion(newComment),
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (err) {
      console.error("Error adding comment to task:", err);
      setError("Failed to add comment: " + err.message);
      return false;
    }
  }, [setError]);
  
  const getTasksByProjectId = useCallback(async (projectIdToFetch) => { 
    if (!projectIdToFetch) return [];
    try {
        setError(null); 
        const q = query(collection(db, 'tasks'), where('projectId', '==', projectIdToFetch), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const subTasksList = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id, 
                ...data,
                title: data.title || "Untitled Task", 
                dueDate: convertFirestoreTimestampToDate(data.dueDate),
                startDate: convertFirestoreTimestampToDate(data.startDate),
                createdAt: convertFirestoreTimestampToDate(data.createdAt),
                updatedAt: convertFirestoreTimestampToDate(data.updatedAt),
            };
        });
        return subTasksList;
    } catch (err) {
        console.error("Error fetching sub-tasks for project", projectIdToFetch, ":", err);
        if (err.code === 'failed-precondition' && err.message.toLowerCase().includes('index')) {
            setError(`Failed to fetch sub-tasks. Firestore requires an index for this query. Please create it in your Firebase console for the 'tasks' collection, on fields 'projectId' (ascending) and 'createdAt' (descending). Error: ${err.message}`);
        } else {
            setError("Failed to fetch sub-tasks for project " + projectIdToFetch + ".");
        }
        return [];
    }
  }, [setError]);


  return { tasks, loading, error, addTask, updateTask, deleteTask, addCommentToTask, getTasksByProjectId, setError };
};