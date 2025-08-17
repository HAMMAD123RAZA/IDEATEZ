
// client/src/admin/TaskManagement/TaskDetailView.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaEdit, FaTrash, FaCommentDots, FaPlus,
  FaSave, FaTimes, FaDownload, FaChevronLeft, FaChevronRight,
  FaSpinner, FaPaperclip, FaUser, FaCalendarAlt, FaInfoCircle, FaTimesCircle,
  FaProjectDiagram, FaTasks as FaTasksIcon 
} from 'react-icons/fa';
import { useTasks } from './hooks/useTasks';
import { useAuth } from '../AuthContext';
import { useUserManagement } from '../hooks/useUserManagement';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskPriorityTag from '../components/TaskPriorityTag';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NotificationModal from '../components/NotificationModal';
import TaskFormModal from './TaskFormModal'; 
import { formatDateToLocal, getTimeAgo } from '../../utils/dateUtils';
import { Timestamp } from 'firebase/firestore';
import { storage } from '../../utils/firebase'; 
import { ref, deleteObject as deleteFirebaseStorageObject, uploadString, getDownloadURL } from "firebase/storage";
import DataTable from '../components/DataTable'; // Import DataTable
import { useSorting } from '../hooks/useSorting'; // Import useSorting


const ALLOWED_FILE_TYPES = [
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
];
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
  '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
];
const MAX_FILE_SIZE_MB = 0.7; 
const MAX_TOTAL_FILES_UPLOAD_AT_ONCE = 10;


const DetailCard = ({ title, icon, children, className = '', cardHeight = 'auto' }) => (
    <div className={`bg-gray-800 rounded-lg shadow-md border border-gray-700 flex flex-col ${className}`} style={{ height: cardHeight }}>
      {title && (
        <div className="flex items-center text-yellow-400 px-4 pt-4 pb-2 border-b border-gray-700">
          {icon}
          <h3 className="ml-2 font-medium text-lg">{title}</h3>
        </div>
      )}
      <div className="flex-grow p-4 flex flex-col">
        {children}
      </div>
    </div>
  );

const TaskDetailView = () => {
  const { taskId } = useParams(); 
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, addCommentToTask, getTasksByProjectId, addTask, loading: tasksLoading, error: tasksErrorHook, setError: setTaskHookError } = useTasks();
  const { users, loading: usersLoading } = useUserManagement();
  const { currentUser, hasPermission } = useAuth();

  const [currentTask, setCurrentTask] = useState(null);
  const [subTasksForProject, setSubTasksForProject] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTaskData, setEditableTaskData] = useState(null);
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState([]);
  const [filesToDeleteFromStorage, setFilesToDeleteFromStorage] = useState([]); 
  
  const [newCommentText, setNewCommentText] = useState('');
  
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false); 
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({ title: '', message: '', type: 'info' });
  const [internalLoading, setInternalLoading] = useState(false);

  const displayNotification = useCallback((title, message, type = 'info') => {
    setNotificationContent({ title, message, type });
    setShowNotification(true);
  }, []);

  const getUserDisplayName = useCallback((userId) => {
    if (userId === 'system' || userId === 'system_initial') return "System Action";
    if (usersLoading || !users || users.length === 0) return userId || 'Unknown';
    const user = users.find(u => u.id === userId);
    return user ? user.displayName : (userId || 'System Action');
  }, [users, usersLoading]);

  const currentTaskFromList = React.useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);

  useEffect(() => {
    setTaskHookError(null); 
    if (currentTaskFromList) {
      setCurrentTask(currentTaskFromList);
      const taskTitleOrName = currentTaskFromList.isProject ? currentTaskFromList.name : currentTaskFromList.title;
      if (!isEditing) { 
        setEditableTaskData({
          ...currentTaskFromList,
          title: taskTitleOrName, 
          name: currentTaskFromList.isProject ? taskTitleOrName : undefined,
          dueDate: currentTaskFromList.dueDate ? (currentTaskFromList.dueDate instanceof Date ? currentTaskFromList.dueDate.toISOString().split('T')[0] : String(currentTaskFromList.dueDate).split('T')[0]) : '',
          startDate: currentTaskFromList.startDate ? (currentTaskFromList.startDate instanceof Date ? currentTaskFromList.startDate.toISOString().split('T')[0] : String(currentTaskFromList.startDate).split('T')[0]) : '',
          files: currentTaskFromList.files ? [...currentTaskFromList.files.map(f => ({...f, uniqueKey: f.uniqueKey || (f.name || `file_${Date.now()}`) + (f.timestamp?.seconds || Date.now()) + Math.random()}))] : [],
        });
      }
      if (currentTaskFromList.isProject) {
        const fetchSubTasks = async () => {
          const subs = await getTasksByProjectId(currentTaskFromList.id);
          setSubTasksForProject(subs);
        };
        fetchSubTasks();
      } else {
        setSubTasksForProject([]); 
      }
    } else if (!tasksLoading) {
      setCurrentTask(null); 
      setSubTasksForProject([]);
    }
    setSelectedFilesToUpload([]);
    setFilesToDeleteFromStorage([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, currentTaskFromList, isEditing, tasksLoading, setTaskHookError, getTasksByProjectId]);


  const base64ToBlob = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    
    const metaPart = parts[0];
    const base64Part = parts[1];
    
    const mimeMatch = metaPart.match(/:(.*?);/);
    const mimeType = mimeMatch && mimeMatch[1] ? mimeMatch[1] : 'application/octet-stream';
    
    try {
      const byteCharacters = atob(base64Part);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (e) {
      console.error("Error converting base64 to Blob:", e);
      return null;
    }
  };

  const downloadBase64File = (fileObject) => {
    const dataUrl = fileObject.base64Data || fileObject.data; 
    const filename = fileObject.name || 'downloaded_file';

    const blob = base64ToBlob(dataUrl);
    if (!blob) {
      displayNotification('Download Error', `Could not process file: ${filename}`, 'error');
      return;
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    setNewCommentText('');
  }, [taskId]);


  const canEditThisTask = hasPermission('tasks_edit_all') || 
  (hasPermission('tasks_edit_own_assigned') && currentTask?.assignedTo?.includes(currentUser?.id));

  const handleEditClick = () => {
    if (!canEditThisTask) {
        displayNotification('Error', "You don't have permission to edit this.", 'error');
        return;
    }
    if (currentTask) {
      const taskTitleOrName = currentTask.isProject ? currentTask.name : currentTask.title;
      setEditableTaskData({
        ...currentTask,
        title: taskTitleOrName, 
        name: currentTask.isProject ? taskTitleOrName : undefined, 
        dueDate: currentTask.dueDate ? (currentTask.dueDate instanceof Date ? currentTask.dueDate.toISOString().split('T')[0] : String(currentTask.dueDate).split('T')[0]) : '',
        startDate: currentTask.startDate ? (currentTask.startDate instanceof Date ? currentTask.startDate.toISOString().split('T')[0] : String(currentTask.startDate).split('T')[0]) : '',
        files: currentTask.files ? [...currentTask.files.map(f => ({...f, uniqueKey: f.uniqueKey || (f.name || `file_${Date.now()}`) + (f.timestamp?.seconds || Date.now()) + Math.random()}))] : [],
        clientName: currentTask.clientName || '', 
        clientId: currentTask.clientId || '',  
      });
      setIsEditing(true);
      setSelectedFilesToUpload([]);
      setFilesToDeleteFromStorage([]);
      setShowNotification(false); 
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentTask) { 
      const taskTitleOrName = currentTask.isProject ? currentTask.name : currentTask.title;
      setEditableTaskData({
        ...currentTask,
        title: taskTitleOrName,
        name: currentTask.isProject ? taskTitleOrName : undefined,
        dueDate: currentTask.dueDate ? (currentTask.dueDate instanceof Date ? currentTask.dueDate.toISOString().split('T')[0] : String(currentTask.dueDate).split('T')[0]) : '',
        startDate: currentTask.startDate ? (currentTask.startDate instanceof Date ? currentTask.startDate.toISOString().split('T')[0] : String(currentTask.startDate).split('T')[0]) : '',
        files: currentTask.files ? [...currentTask.files.map(f => ({...f, uniqueKey: f.uniqueKey || (f.name || `file_${Date.now()}`) + (f.timestamp?.seconds || Date.now()) + Math.random()}))] : [],
      });
    }
    setSelectedFilesToUpload([]);
    setFilesToDeleteFromStorage([]);
    setTaskHookError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newStatus = editableTaskData.status;

    if (name === "startDate" && value) {
        const selectedStartDate = new Date(value);
        const today = new Date();
        today.setHours(0,0,0,0); 
        if (selectedStartDate <= today) {
            newStatus = 'in-progress';
        }
    }
    
    setEditableTaskData(prev => ({ 
        ...prev, 
        [name]: value,
        ...(prev.isProject && name === 'title' ? { name: value } : {}), 
        ...(!prev.isProject && name === 'name' ? { title: value } : {}),
        status: (name === "startDate" && newStatus !== prev.status) ? newStatus : prev.status,
    }));
  };
  
  const handleMultiUserChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setEditableTaskData(prev => ({ ...prev, assignedTo: selectedOptions }));
  };

  const handleFileSelectionChange = useCallback((e) => {
    if (!hasPermission('tasks_manage_files')) {
        displayNotification('Error', "You don't have permission to upload files.", 'error');
        return;
    }
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if ((selectedFilesToUpload.length + files.length) > MAX_TOTAL_FILES_UPLOAD_AT_ONCE) {
        displayNotification('Error', `Cannot upload more than ${MAX_TOTAL_FILES_UPLOAD_AT_ONCE} files at once.`, 'error');
        return;
    }
    
    const validFiles = [];
    const errors = [];

    for (const file of files) {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            errors.push(`File type not allowed for: ${file.name}`);
            continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            errors.push(`File size exceeds ${MAX_FILE_SIZE_MB}MB for: ${file.name}`);
            continue;
        }
        if (editableTaskData?.files?.some(f => f.name === file.name) || selectedFilesToUpload.some(f => f.name === file.name)) {
            errors.push(`File with name ${file.name} already exists or is selected.`);
            continue;
        }
        validFiles.push(file);
    }

    if (errors.length > 0) {
        displayNotification('File Validation Error', errors.join('\n'), 'error');
    }
    
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedFilesToUpload(prev => [
                ...prev,
                { name: file.name, type: file.type, size: file.size, base64Data: event.target.result, keyForList: Date.now() + file.name }
            ]);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = null; 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableTaskData?.files, selectedFilesToUpload, displayNotification, hasPermission]);

  const handleRemoveNewSelectedFile = (fileKeyToRemove) => {
    setSelectedFilesToUpload(prev => prev.filter(file => file.keyForList !== fileKeyToRemove));
  };

  const handleDeleteExistingFile = (fileToDelete) => {
     if (!hasPermission('tasks_manage_files')) {
        displayNotification('Error', "You don't have permission to delete files.", 'error');
        return;
    }
    setEditableTaskData(prev => ({
        ...prev,
        files: prev.files.filter(f => f.uniqueKey !== fileToDelete.uniqueKey)
    }));
    if (fileToDelete.fullPath) {
        setFilesToDeleteFromStorage(prev => [...prev, fileToDelete.fullPath]);
    }
  };

  const handleSaveChanges = async () => {
    if (!canEditThisTask) {
      displayNotification('Error', "You don't have permission to save changes.", 'error');
      return;
    }
    const titleToValidate = editableTaskData.isProject ? editableTaskData.name : editableTaskData.title;
    if (!editableTaskData || !titleToValidate || !titleToValidate.trim()) {
      displayNotification('Validation Error', `${currentTask.isProject ? 'Project Name' : 'Task Title'} is required.`, 'error');
      return;
    }
    setInternalLoading(true);
    setShowNotification(false);
    setTaskHookError(null);

    const finalTaskData = { ...editableTaskData };
    if (finalTaskData.isProject) {
        finalTaskData.name = titleToValidate.trim(); 
        delete finalTaskData.title; 
    } else {
        finalTaskData.title = titleToValidate.trim(); 
        delete finalTaskData.name; 
    }
    
    const keptExistingFiles = finalTaskData.files.map(({uniqueKey, ...rest}) => rest);
    
    const newUploadedFilePayloads = [];
    if (selectedFilesToUpload.length > 0) {
        for (const newFile of selectedFilesToUpload) {
            const storagePath = `tasks/${taskId}/files/${Date.now()}_${newFile.name}`;
            const fileRef = ref(storage, storagePath);
            try {
                const snapshot = await uploadString(fileRef, newFile.base64Data, 'data_url');
                const downloadURL = await getDownloadURL(snapshot.ref);
                newUploadedFilePayloads.push({
                    name: newFile.name, type: newFile.type, size: newFile.size,
                    url: downloadURL, fullPath: storagePath, 
                    uploadedBy: currentUser?.id || 'system', timestamp: Timestamp.now(),
                });
            } catch(uploadError) {
                console.error("Error uploading file to Firebase Storage:", uploadError);
                displayNotification('File Upload Error', `Failed to upload ${newFile.name}.`, 'error');
                setInternalLoading(false);
                return; 
            }
        }
    }

    finalTaskData.files = [...keptExistingFiles, ...newUploadedFilePayloads];
    
    if (filesToDeleteFromStorage.length > 0) {
        for (const path of filesToDeleteFromStorage) {
            try {
                await deleteFirebaseStorageObject(ref(storage, path));
                console.log(`File deleted from storage: ${path}`);
            } catch (storageError) {
                console.error(`Error deleting file ${path} from storage:`, storageError);
            }
        }
    }

    finalTaskData._filesToDeleteFromStorage = []; 

    const success = await updateTask(taskId, finalTaskData);
    setInternalLoading(false);

    if (success) {
      displayNotification('Success', `${currentTask.isProject ? 'Project' : 'Task'} updated successfully!`, 'success');
      setIsEditing(false);
      setSelectedFilesToUpload([]);
      setFilesToDeleteFromStorage([]);
    } else {
      displayNotification('Error', tasksErrorHook || `Failed to update ${currentTask.isProject ? 'project' : 'task'}.`, 'error');
    }
  };

  const handleDeleteTask = () => {
    const canDeleteThis = hasPermission('tasks_delete_all') || 
                          (hasPermission('tasks_delete_own') && currentTask?.createdBy === currentUser?.id);
    if (!canDeleteThis) {
        displayNotification('Error', "You don't have permission to delete this.", 'error');
        return;
    }
    setShowDeleteTaskModal(true);
  }

  const confirmDeleteTask = async () => {
    if (!currentTask) return;
    setInternalLoading(true);
    setShowNotification(false);
    setTaskHookError(null);
    
    if (currentTask.files && currentTask.files.length > 0) {
        for (const file of currentTask.files) {
            if (file.fullPath) { 
                 try {
                    await deleteFirebaseStorageObject(ref(storage, file.fullPath));
                 } catch (storageError) {
                    console.warn(`Could not delete file ${file.fullPath} from storage during task deletion:`, storageError);
                 }
            }
        }
    }

    const success = await deleteTask(taskId);
    setInternalLoading(false);
    if (success) {
      displayNotification('Success', `${currentTask.isProject ? 'Project' : 'Task'} and associated items deleted!`, 'success');
      setShowDeleteTaskModal(false);
      setTimeout(() => navigate('/admin/tasks'), 1500);
    } else {
      displayNotification('Error', tasksErrorHook || 'Failed to delete item.', 'error');
      setShowDeleteTaskModal(false);
    }
  };

  const handleDeleteCommentClick = (commentToDelete) => {
    if (!hasPermission('tasks_delete_comment') && commentToDelete.userId !== currentUser?.id) {
        displayNotification('Error', "You don't have permission to delete this comment.", 'error');
        return;
    }
    setCommentToDelete(commentToDelete);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!currentTask || !commentToDelete) return;
    
    const updatedComments = currentTask.comments.filter(
      c => c.timestamp.seconds !== commentToDelete.timestamp.seconds || c.userId !== commentToDelete.userId || c.text !== commentToDelete.text
    );

    const success = await updateTask(taskId, { comments: updatedComments });
    if (success) {
        displayNotification('Success', 'Comment deleted.', 'success');
        setCurrentTask(prev => prev ? ({ ...prev, comments: updatedComments}) : null);
    } else {
        displayNotification('Error', 'Failed to delete comment.', 'error');
    }
    setShowDeleteCommentModal(false);
    setCommentToDelete(null);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !hasPermission('tasks_manage_comments')) return;
    setInternalLoading(true);
    const success = await addCommentToTask(taskId, { text: newCommentText, userId: currentUser?.id });
    setInternalLoading(false);
    if (success) {
        setNewCommentText('');
    } else {
        displayNotification('Error', tasksErrorHook || 'Failed to add comment.', 'error');
    }
  };

  const currentTaskIndex = tasks.findIndex(t => t.id === taskId);
  const navigateToTask = (index) => {
    if (index >= 0 && index < tasks.length) {
      setIsEditing(false); 
      navigate(`/admin/tasks/${tasks[index].id}`);
    }
  };
  
  const handleOpenSubTaskModal = () => {
      if (!currentTask || !currentTask.isProject) return;
      setIsSubTaskModalOpen(true);
  };
  
  const handleSaveNewSubTask = async (subTaskPayload) => {
      if (!currentTask || !currentTask.isProject) {
          displayNotification('Error', 'Cannot add sub-task to a non-project item.', 'error');
          return;
      }
      const parentProjectAssignees = currentTask.assignedTo || [];
      const subTaskData = {
          ...subTaskPayload,
          projectId: currentTask.id, 
          clientId: currentTask.clientId, 
          clientName: currentTask.clientName,
          assignedTo: subTaskPayload.assignedTo && subTaskPayload.assignedTo.length > 0 ? subTaskPayload.assignedTo : parentProjectAssignees,
      };

      const newSubTaskId = await addTask(subTaskData, []); 
      if (newSubTaskId) {
          displayNotification('Success', `Sub-task added to ${currentTask.name}!`, 'success');
          setIsSubTaskModalOpen(false);
          const updatedSubTasks = await getTasksByProjectId(currentTask.id);
          setSubTasksForProject(updatedSubTasks); 
      } else {
          displayNotification('Error', tasksErrorHook || 'Failed to add sub-task.', 'error');
      }
  };

   // Sub-tasks DataTable
  const { sortedData: sortedSubTasks, requestSort: requestSubTaskSort, getSortIndicator: getSubTaskSortIndicator } = useSorting(subTasksForProject);
  
  const subTaskColumns = useMemo(() => [
    {
      key: 'icon', label: '', sortable: false,
      render: () => <FaTasksIcon className="text-gray-400" />
    },
    {
      key: 'startDate', label: 'Start Date', sortable: true,
      render: (date) => date ? formatDateToLocal(new Date(date)) : 'N/A'
    },
    {
      key: 'title', label: 'Title & ID', sortable: true,
      render: (title, item) => (
        hasPermission('tasks_view_details') ? 
        <Link to={`/admin/tasks/${item.id}`} className="hover:underline text-yellow-400">
          {title} <span className="text-xs text-gray-500">({item.id})</span>
        </Link>
        : <>{title} <span className="text-xs text-gray-500">({item.id})</span></>
      )
    },
    {
      key: 'dueDate', label: 'Due Date', sortable: true,
      render: (date) => date ? formatDateToLocal(new Date(date)) : 'N/A'
    },
    {
      key: 'assignedTo', label: 'Assigned To', sortable: false,
      render: (assignedTo) => (
        <div className="flex flex-wrap gap-1 max-w-[150px] overflow-hidden">
          {assignedTo && assignedTo.length > 0 
            ? assignedTo.map(userId => (
                <span key={userId} className="text-xs bg-gray-600 text-gray-200 px-1.5 py-0.5 rounded-full truncate" title={getUserDisplayName(userId)}>
                  {getUserDisplayName(userId)}
                </span>
              ))
            : <span className="text-xs text-gray-500">Unassigned</span>
          }
        </div>
      )
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (status) => <TaskStatusBadge status={status} />
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [getUserDisplayName, hasPermission]);


  if (tasksLoading || (usersLoading && !currentTask && !tasksErrorHook)) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-yellow-500 text-4xl" />
      </div>
    );
  }

  if (!currentTask && !tasksLoading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex flex-col justify-center items-center">
        <p className="text-red-400 text-xl mb-4">Item not found or an error occurred.</p>
        <button onClick={() => navigate('/admin/tasks')} className="flex items-center text-yellow-400 hover:text-yellow-300 bg-gray-700 px-4 py-2 rounded-md">
          <FaArrowLeft className="mr-2" /> Back to List
        </button>
      </div>
    );
  }
  
  if (!currentTask || (isEditing && !editableTaskData)) { 
     return (
        <div className="p-6 bg-gray-900 min-h-screen flex justify-center items-center">
             <FaSpinner className="animate-spin text-yellow-500 text-4xl" />
        </div>
     );
  }

  const displayData = isEditing ? editableTaskData : currentTask;
  const entityType = displayData.isProject ? 'Project' : 'Task';
  const entityTitle = displayData.isProject ? displayData.name : displayData.title;


  return (
    <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
      <NotificationModal show={showNotification} onClose={() => setShowNotification(false)} title={notificationContent.title} message={notificationContent.message} type={notificationContent.type} />
      {isSubTaskModalOpen && currentTask && currentTask.isProject && (
          <TaskFormModal
              isOpen={isSubTaskModalOpen}
              onClose={() => setIsSubTaskModalOpen(false)}
              onSave={handleSaveNewSubTask}
              task={null} // For new sub-task
              users={users}
              parentProjectInfo={{ 
                  id: currentTask.id, 
                  name: currentTask.name,
                  clientId: currentTask.clientId, 
                  clientName: currentTask.clientName,
                  clientUid: users.find(u => u.id === currentTask.clientId)?.uid, 
                  assignedTo: currentTask.assignedTo, 
                }}
          />
      )}
      
      <div className="sticky top-0 z-30 bg-gray-900 py-4 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <button onClick={() => navigate('/admin/tasks')} className="flex items-center text-yellow-400 hover:text-yellow-300 bg-gray-800 px-4 py-2 rounded-md">
            <FaArrowLeft className="mr-2" /> Back to List
          </button>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateToTask(currentTaskIndex - 1)} disabled={currentTaskIndex <= 0} className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"><FaChevronLeft /></button>
            <span className="text-sm text-gray-400">{currentTaskIndex + 1} of {tasks.length}</span>
            <button onClick={() => navigateToTask(currentTaskIndex + 1)} disabled={currentTaskIndex >= tasks.length - 1} className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"><FaChevronRight /></button>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && canEditThisTask && (
                <button onClick={handleSaveChanges} className="p-2 text-green-400 hover:text-green-300 rounded-md hover:bg-green-500/10" title="Save Changes"><FaSave size={18}/></button>
            )}
            {!isEditing && canEditThisTask && (
              <button onClick={handleEditClick} className="p-2 text-blue-400 hover:text-blue-300 rounded-md hover:bg-blue-500/10" title={`Edit ${entityType}`}><FaEdit size={18}/></button>
            )}
            {isEditing && (
              <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700/70" title="Cancel Edit"><FaTimes size={18}/></button>
            )}
            {(hasPermission('tasks_delete_all') || (hasPermission('tasks_delete_own') && currentTask?.createdBy === currentUser?.id)) && (
              <button onClick={handleDeleteTask} className="p-2 text-red-500 hover:text-red-400 rounded-md hover:bg-red-500/10" title={`Delete ${entityType}`}><FaTrash size={18}/></button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1 lg:row-span-2">
            <DetailCard title={`${entityType} Details`} icon={displayData.isProject ? <FaProjectDiagram /> : <FaCalendarAlt />}>
                <div className="space-y-3 text-sm">
                    <div>
                        <label className="block text-xs text-gray-500">Client</label>
                        <p className="text-gray-200">{displayData.clientName || 'N/A'} ({displayData.clientId || 'N/A'})</p>
                    </div>
                    {!displayData.isProject && displayData.projectId && (
                        <div>
                            <label className="block text-xs text-gray-500">Parent Project</label>
                            <Link to={`/admin/tasks/${displayData.projectId}`} className="text-blue-400 hover:underline">
                                {tasks.find(t => t.id === displayData.projectId)?.name || 'View Project'} ({displayData.projectId})
                            </Link>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-gray-500">Start Date</label>
                        {isEditing && canEditThisTask ? <input type="date" name="startDate" value={editableTaskData.startDate} onChange={handleInputChange} className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs"/> : <p className="text-gray-200">{displayData.startDate ? formatDateToLocal(new Date(displayData.startDate)) : 'N/A'}</p>}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Due Date</label>
                        {isEditing && canEditThisTask ? <input type="date" name="dueDate" value={editableTaskData.dueDate} onChange={handleInputChange} className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs"/> : <p className="text-gray-200">{displayData.dueDate ? formatDateToLocal(new Date(displayData.dueDate)) : 'N/A'}</p>}
                         {displayData.isProject && !isEditing && (
                            <span className="text-xxs text-gray-500 block">(Manually set for project.)</span>
                         )}
                    </div>
                     <div>
                        <label className="block text-xs text-gray-500">Status</label>
                        {isEditing && canEditThisTask ? (
                            <select name="status" value={editableTaskData.status} onChange={handleInputChange} className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs">
                                <option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="canceled">Canceled</option>
                            </select>
                        ) : <TaskStatusBadge status={displayData.status} />}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Priority</label>
                        {isEditing && canEditThisTask ? (
                            <select name="priority" value={editableTaskData.priority} onChange={handleInputChange} className="w-full p-1.5 bg-gray-700 border border-gray-600 rounded-md text-xs">
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                            </select>
                        ) : <TaskPriorityTag priority={displayData.priority} />}
                    </div>
                     <div>
                        <label className="block text-xs text-gray-500">Created By</label>
                        <p className="text-gray-400 text-xs">{getUserDisplayName(displayData.createdBy)} - {getTimeAgo(displayData.createdAt)}</p>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <p className="text-gray-400 text-xs">{getUserDisplayName(displayData.updatedBy || displayData.createdBy)} - {getTimeAgo(displayData.updatedAt || displayData.createdAt)}</p>
                    </div>
                </div>
            </DetailCard>
        </div>
        
        <div className="lg:col-span-2 lg:row-span-2">
            <DetailCard title={`${entityType} Information`} icon={<FaInfoCircle />}>
                <div className="space-y-4 flex flex-col flex-grow">
                    <div>
                        <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-400 mb-1">{entityType === 'Project' ? 'Project Name' : 'Task Title'}</label>
                        {isEditing && canEditThisTask ? (
                        <input type="text" name={entityType === 'Project' ? 'name' : 'title'} id="taskTitle" value={entityType === 'Project' ? editableTaskData.name : editableTaskData.title} onChange={handleInputChange} className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 text-xl font-semibold"/>
                        ) : (
                        <h1 className="text-2xl font-bold text-yellow-500 break-words">{entityTitle} ({displayData.id})</h1>
                        )}
                    </div>
                    <div className="flex-grow flex flex-col">
                        <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        {isEditing && canEditThisTask ? (
                        <textarea name="description" id="taskDescription" value={editableTaskData.description} onChange={handleInputChange} className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 resize-none flex-grow"></textarea>
                        ) : (
                        <p className="text-gray-300 whitespace-pre-wrap bg-gray-750 p-3 rounded-md flex-grow">{displayData.description || 'No description.'}</p>
                        )}
                    </div>
                </div>
            </DetailCard>
        </div>
        
        <div className="lg:col-span-1 lg:row-span-2">
            <DetailCard title="Attachments" icon={<FaPaperclip />} cardHeight="100%">
                {isEditing && hasPermission('tasks_manage_files') && (
                    <div className="mb-4">
                        <label htmlFor="taskFiles" className="block text-sm font-medium text-gray-400 mb-1">Add New Files</label>
                        <div className="text-xs text-gray-500 mb-2">Up to {MAX_FILE_SIZE_MB}MB. Max {MAX_TOTAL_FILES_UPLOAD_AT_ONCE} new.</div>
                        <input type="file" id="taskFiles" multiple onChange={handleFileSelectionChange} className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"/>
                        {selectedFilesToUpload.length > 0 && (
                            <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                                {selectedFilesToUpload.map(file => (
                                <div key={file.keyForList} className="text-xs p-1 bg-gray-700 rounded-md flex justify-between items-center">
                                    <span className="truncate mr-2">{file.name}</span>
                                    <button onClick={() => handleRemoveNewSelectedFile(file.keyForList)} className="text-red-400 hover:text-red-300 p-0.5 rounded-full"><FaTimesCircle size={14} /></button>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className={`space-y-1 flex-grow ${isEditing ? 'max-h-40' : ''} overflow-y-auto`}>
                  {(isEditing ? editableTaskData.files : currentTask.files)?.length > 0 ? (
                    (isEditing ? editableTaskData.files : currentTask.files).map(file => (
                      <div key={file.uniqueKey || file.name} className="flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600 rounded-md">
                        <div className="flex items-center min-w-0">
                          <FaDownload className="text-blue-400 mr-2 flex-shrink-0"/>
                          {file.url ? ( 
                            <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="text-blue-400 hover:underline text-sm truncate" title={file.name}>{file.name}</a>
                          ) : ( 
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                downloadBase64File(file); 
                              }}
                              className="text-blue-400 hover:underline text-sm truncate" 
                              title={file.name}
                            >
                              {file.name}
                            </a>
                          )}
                          <span className="text-xs text-gray-500 ml-2">({Math.round((file.size || 0) / 1024)} KB)</span>
                        </div>
                        {isEditing && hasPermission('tasks_manage_files') && (
                            <button onClick={() => handleDeleteExistingFile(file)} className="text-red-400 hover:text-red-300 p-1 rounded-full ml-2"><FaTrash size={12}/></button>
                        )}
                      </div>
                    ))
                  ) : <p className="text-sm text-gray-500 italic">No files attached.</p>}
                </div>
            </DetailCard>
        </div>

        <div className="lg:col-span-3 lg:row-start-3">
             <DetailCard title="Add Comment" icon={<FaCommentDots /> } className="h-full">
                {hasPermission('tasks_manage_comments') ? (
                    <>
                        <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Write a comment..." rows="3" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                        <button onClick={handleAddComment} disabled={!newCommentText.trim() || internalLoading} className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm disabled:opacity-50 flex items-center justify-center">
                            {internalLoading && !commentToDelete ? <FaSpinner className="animate-spin mr-2"/> : <FaPlus className="mr-2"/>} Add Comment
                        </button>
                    </>
                ) : <p className="text-sm text-gray-500 italic">You do not have permission to add comments.</p>}
            </DetailCard>
        </div>

        <div className="lg:col-span-1 lg:row-start-3">
            <DetailCard title="Assigned To" icon={<FaUser />} className="h-full">
                 {isEditing && hasPermission('tasks_assign_users') ? (
                    <select multiple name="assignedTo" value={editableTaskData.assignedTo || []} onChange={handleMultiUserChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-xs h-full">
                        {usersLoading ? <option>Loading users...</option> : users.map(user => <option key={user.id} value={user.id}>{user.displayName}</option>)}
                    </select>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {displayData.assignedTo && displayData.assignedTo.length > 0 ? displayData.assignedTo.map(uid => (
                            <span key={uid} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">{getUserDisplayName(uid)}</span>
                        )) : <p className="text-gray-500 text-xs italic">Unassigned</p>}
                    </div>
                )}
            </DetailCard>
        </div>
        
        {currentTask.isProject && (
          <div className="lg:col-span-4 lg:row-start-4">
            <DetailCard title="Sub-Tasks" icon={<FaTasksIcon />}>
             {hasPermission('tasks_create') && (
                 <button 
                    onClick={handleOpenSubTaskModal}
                    className="mb-3 flex items-center text-green-400 hover:text-green-300 text-sm"
                >
                    <FaPlus className="mr-1" /> Add Sub-Task
                 </button>
             )}
              {subTasksForProject.length > 0 ? (
                <div className="overflow-x-auto">
                  <DataTable
                    data={sortedSubTasks}
                    columns={subTaskColumns}
                    onRowClick={(subTask) => { if (hasPermission('tasks_view_details')) navigate(`/admin/tasks/${subTask.id}`)}}
                    requestSort={requestSubTaskSort}
                    getSortIndicator={getSubTaskSortIndicator}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No sub-tasks for this project.</p>
              )}
            </DetailCard>
          </div>
        )}


        <div className={`lg:col-span-4 ${currentTask.isProject ? 'lg:row-start-5' : 'lg:row-start-4'}`}>
            <DetailCard title="Comment History" icon={<FaCommentDots />}>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {currentTask.comments && currentTask.comments.length > 0 ? (
                    currentTask.comments.slice().sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0)).map((comment, index) => (
                        <div key={index} className="bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{comment.text}</p>
                        <div className="text-xs text-gray-500 mt-1">
                            By: {getUserDisplayName(comment.userId)} - {comment.timestamp ? getTimeAgo(new Date(comment.timestamp)) : 'Date unknown'}
                            {(hasPermission('tasks_delete_comment') || comment.userId === currentUser?.id) && (
                                <button onClick={() => handleDeleteCommentClick(comment)} className="ml-2 text-red-500 hover:text-red-400 text-xxs" title="Delete comment"><FaTrash size={10}/></button>
                            )}
                        </div>
                        </div>
                    ))
                    ) : <p className="text-sm text-gray-500 italic">No comments yet.</p>}
                </div>
            </DetailCard>
        </div>

        {isEditing && (
          <div className={`lg:col-span-4 flex justify-end mt-4 ${currentTask.isProject ? 'lg:row-start-6' : 'lg:row-start-5'}`}>
            <button onClick={handleSaveChanges} disabled={internalLoading || !canEditThisTask} className="flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50">
              {internalLoading ? <FaSpinner className="animate-spin mr-2"/> : <FaSave className="mr-2"/>} Save Changes
            </button>
          </div>
        )}
      </div>
      
      <DeleteConfirmModal show={showDeleteTaskModal} onClose={() => setShowDeleteTaskModal(false)} onConfirm={confirmDeleteTask} title={`Confirm ${entityType} Deletion`} message={`Are you sure you want to delete "${entityTitle}"? This action cannot be undone.${currentTask?.isProject ? ' All associated sub-tasks will also be deleted.' : ''}`}/>
      <DeleteConfirmModal show={showDeleteCommentModal} onClose={() => {setShowDeleteCommentModal(false); setCommentToDelete(null);}} onConfirm={confirmDeleteComment} title="Confirm Comment Deletion" message="Are you sure you want to delete this comment?"/>
    </div>
  );
};

export default TaskDetailView;