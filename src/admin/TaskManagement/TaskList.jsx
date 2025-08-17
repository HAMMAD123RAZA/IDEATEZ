
// client/src/admin/TaskManagement/TaskList.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEye, FaProjectDiagram, FaTasks } from 'react-icons/fa';
import { MdSkipPrevious, MdSkipNext, MdFirstPage, MdLastPage } from 'react-icons/md';

import { useTasks } from './hooks/useTasks';
import { useAuth } from '../AuthContext'; 
import { useUserManagement } from '../hooks/useUserManagement'; 

import DataTable from '../components/DataTable';
import TaskFormModal from './TaskFormModal'; 
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NotificationModal from '../components/NotificationModal';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskPriorityTag from '../components/TaskPriorityTag';

import { useSorting } from '../hooks/useSorting';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { usePagination } from '../hooks/usePagination';
import { formatDateToLocal } from '../../utils/dateUtils';

const TaskList = () => {
  const { tasks, loading: tasksLoading, error: tasksErrorHook, addTask, deleteTask, setError: setTaskHookError } = useTasks();
  const { users: usersFromHook, loading: usersLoadingForAssign, error: usersErrorFromHook } = useUserManagement(); 
  
  const allUsersForAssign = useMemo(() => {
    if (usersLoadingForAssign || usersErrorFromHook || !usersFromHook) {
        return [];
    }
    return usersFromHook;
  }, [usersFromHook, usersLoadingForAssign, usersErrorFromHook]);

  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('title_or_name'); 
  const [viewType, setViewType] = useState('all'); 

  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({ title: '', message: '', type: 'info' });

  const displayNotification = (title, message, type = 'info') => {
    setNotificationContent({ title, message, type });
    setShowNotification(true);
  };

  const getUserDisplayName = useCallback((userId) => {
    if (allUsersForAssign.length === 0) { // Handles loading, error, or empty usersFromHook via allUsersForAssign
        return userId;
    }
    const user = allUsersForAssign.find(u => u.id === userId);
    return user ? user.displayName : userId; 
  }, [allUsersForAssign]);

  const filteredTasksByType = useMemo(() => {
    if (viewType === 'projects') return tasks.filter(t => t.isProject);
    if (viewType === 'tasks') return tasks.filter(t => !t.isProject);
    return tasks;
  }, [tasks, viewType]);

  const { sortedData, requestSort, getSortIndicator } = useSorting(filteredTasksByType);
  const filteredBySearch = useSearchFilter(sortedData, filterText, filterType);
  const { paginatedData, currentPage, totalPages, setCurrentPage } = usePagination(filteredBySearch, 10);

  const handleOpenNewTaskModal = () => {
    if (!hasPermission('tasks_create')) {
        displayNotification('Error', "You don't have permission to create tasks or projects.", 'error');
        return;
    }
    setIsNewTaskModalOpen(true);
    setTaskHookError(null); 
  };

  const handleCloseNewTaskModal = () => {
    setIsNewTaskModalOpen(false);
  };

  const handleSaveNewTaskOrProject = async (taskData, subTasksData = []) => {
    const newEntityId = await addTask(taskData, subTasksData);
    if (newEntityId) {
      displayNotification('Success', `${taskData.isProject ? 'Project' : 'Task'} added successfully! ID: ${newEntityId}`, 'success');
      handleCloseNewTaskModal();
    } else {
      displayNotification('Error', tasksErrorHook || `Failed to add ${taskData.isProject ? 'project' : 'task'}.`, 'error');
    }
  };
  
  const handleDeleteClick = (task) => {
    if (!hasPermission('tasks_delete_all') && !(hasPermission('tasks_delete_own') /* && check if current user owns task */)) { 
        displayNotification('Error', "You don't have permission to delete this item.", 'error');
        return;
    }
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      const success = await deleteTask(taskToDelete.id); 
      if (success) {
        displayNotification('Success', 'Item deleted successfully!', 'success');
      } else {
        displayNotification('Error', tasksErrorHook || 'Failed to delete item.', 'error');
      }
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const projectColumns = useMemo(() => [
    {
      key: 'id', 
      label: 'Project ID',
      sortable: true,
      render: (idVal, item) => ( 
        hasPermission('tasks_view_details') ? 
        <Link to={`/admin/tasks/${item.id}`} className="hover:underline text-yellow-400">{idVal}</Link>
        : <span className="text-yellow-400">{idVal}</span>
      )
    },
    { key: 'name', label: 'Project Name', sortable: true },
    { key: 'clientName', label: 'Client', sortable: true, render: clientName => clientName || 'N/A'},
    { key: 'subTaskIds', label: 'Tasks Count', sortable: false, render: subTaskIds => (subTaskIds ? subTaskIds.length : 0) },
    { key: 'status', label: 'Status', sortable: true, render: status => <TaskStatusBadge status={status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => ( 
        <div className="flex items-center space-x-2">
          {hasPermission('tasks_view_details') && (
            <button onClick={() => navigate(`/admin/tasks/${item.id}`)} className="text-blue-400 hover:text-blue-300 p-1" title="View Details"><FaEye /></button>
          )}
        </div>
      )
    }
  ], [navigate, hasPermission]);

  const taskColumns = useMemo(() => [
    {
      key: 'id', 
      label: 'Task ID',
      sortable: true,
      render: (idVal, item) => ( 
        hasPermission('tasks_view_details') ? 
        <Link to={`/admin/tasks/${item.id}`} className="hover:underline text-yellow-400">{idVal}</Link>
        : <span className="text-yellow-400">{idVal}</span>
      )
    },
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'projectId',
      label: 'Parent Project',
      sortable: true,
      render: (projectIdVal) => { 
        if (!projectIdVal) return <span className="text-gray-500 italic">Standalone</span>;
        const parentProject = tasks.find(t => t.id === projectIdVal); 
        return parentProject ? 
          (hasPermission('tasks_view_details') ? <Link to={`/admin/tasks/${parentProject.id}`} className="text-blue-400 hover:underline">{parentProject.name}</Link> : parentProject.name) 
          : <span className="text-gray-500 italic">Unknown Project</span>;
      }
    },
    { key: 'clientName', label: 'Client', sortable: true, render: clientName => clientName || 'N/A'},
    { key: 'priority', label: 'Priority', sortable: true, render: priority => <TaskPriorityTag priority={priority} /> },
    { key: 'status', label: 'Status', sortable: true, render: status => <TaskStatusBadge status={status} /> },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: false, 
      render: (assignedTo) => (
        <div className="flex flex-wrap gap-1">
          {assignedTo && assignedTo.length > 0 
            ? assignedTo.map(userId => ( 
                <span key={userId} className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full">
                  {getUserDisplayName(userId)}
                </span>
              ))
            : <span className="text-xs text-gray-500">Unassigned</span>
          }
        </div>
      )
    },
    { key: 'dueDate', label: 'Due Date', sortable: true, render: dueDate => dueDate ? formatDateToLocal(dueDate) : 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => ( 
        <div className="flex items-center space-x-2">
          {hasPermission('tasks_view_details') && (
            <button onClick={() => navigate(`/admin/tasks/${item.id}`)} className="text-blue-400 hover:text-blue-300 p-1" title="View Details"><FaEye /></button>
          )}
        </div>
      )
    }
  ], [navigate, getUserDisplayName, hasPermission, tasks]);

  const allViewColumns = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: false, 
      render: (_, item) => (
        item.isProject 
          ? <span className="inline-flex items-center text-purple-300"><FaProjectDiagram className="mr-1.5"/> Project</span> 
          : <span className="inline-flex items-center text-gray-400"><FaTasks className="mr-1.5"/> Task</span>
      )
    },
    {
      key: 'id', 
      label: 'ID',
      sortable: true,
      render: (idVal, item) => ( 
        hasPermission('tasks_view_details') ? 
        <Link to={`/admin/tasks/${item.id}`} className="hover:underline text-yellow-400">{idVal}</Link>
        : <span className="text-yellow-400">{idVal}</span>
      )
    },
    {
      key: 'title_or_name', 
      label: 'Name / Title',
      sortable: true,
      render: (_, item) => item.isProject ? item.name : item.title
    },
    { key: 'clientName', label: 'Client', sortable: true, render: clientName => clientName || 'N/A'},
    { key: 'status', label: 'Status', sortable: true, render: status => <TaskStatusBadge status={status} /> },
    { key: 'priority', label: 'Priority', sortable: true, render: priority => <TaskPriorityTag priority={priority} /> },
    { key: 'dueDate', label: 'Due Date', sortable: true, render: dueDate => dueDate ? formatDateToLocal(dueDate) : 'N/A' },
     {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => ( 
        <div className="flex items-center space-x-2">
          {hasPermission('tasks_view_details') && (
            <button onClick={() => navigate(`/admin/tasks/${item.id}`)} className="text-blue-400 hover:text-blue-300 p-1" title="View Details"><FaEye /></button>
          )}
        </div>
      )
    }
  ], [navigate, hasPermission]);


  const currentColumns = viewType === 'projects' ? projectColumns : (viewType === 'tasks' ? taskColumns : allViewColumns);


  if (tasksLoading || usersLoadingForAssign) {
    return <div className="p-6 text-center text-gray-300">Loading tasks and user data...</div>;
  }
  
  return (
    <div className="p-4 md:p-6 bg-gray-900 text-gray-100 min-h-screen">
      <NotificationModal
        show={showNotification}
        onClose={() => setShowNotification(false)}
        title={notificationContent.title}
        message={notificationContent.message}
        type={notificationContent.type}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">Task & Project Management</h1>
        {hasPermission('tasks_create') && 
            <button
                onClick={handleOpenNewTaskModal}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow-md transition-colors"
                >
                <FaPlus /> Create New
            </button>
        }
      </div>

      {tasksErrorHook && <p className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-md border border-red-600">{tasksErrorHook}</p>}

      {/* View Type Toggle */}
      <div className="mb-4 flex justify-center space-x-3">
        {['all', 'projects', 'tasks'].map((type) => (
            <button
            key={type}
            onClick={() => {setViewType(type); setCurrentPage(1);}}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                        ${viewType === type 
                            ? 'bg-yellow-600 text-gray-900' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
            >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
        ))}
      </div>

      <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-400 mb-1">Filter By</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                    <option value="title_or_name">Name / Title</option>
                    <option value="id">ID (PID/TID)</option>
                    <option value="clientName">Client Name</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="description">Description</option>
                </select>
            </div>
            <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={`Search by ${filterType.replace('_', ' ')}...`}
                    className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
            </div>
        </div>
         {totalPages > 1 && (
            <div className="flex items-center space-x-1 mt-4 md:mt-0">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 text-white" aria-label="First page"><MdFirstPage size={18}/></button>
                <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 text-white" aria-label="Previous page"><MdSkipPrevious size={18}/></button>
                <span className="text-xs text-gray-400 px-2">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} className="p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 text-white" aria-label="Next page"><MdSkipNext size={18}/></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 text-white" aria-label="Last page"><MdLastPage size={18}/></button>
            </div>
        )}
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <DataTable
          data={paginatedData}
          columns={currentColumns}
          onRowClick={(item) => { if (hasPermission('tasks_view_details')) navigate(`/admin/tasks/${item.id}`)}}
          requestSort={requestSort}
          getSortIndicator={getSortIndicator}
        />
      </div>

      {isNewTaskModalOpen && (
        <TaskFormModal
          isOpen={isNewTaskModalOpen}
          onClose={handleCloseNewTaskModal}
          onSave={handleSaveNewTaskOrProject} 
          task={null} 
          users={allUsersForAssign} 
        />
      )}

      <DeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteTask}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${taskToDelete?.title || taskToDelete?.name}"? ${taskToDelete?.isProject ? 'All its sub-tasks will also be deleted.' : ''} This action cannot be undone.`}
      />
    </div>
  );
};

export default TaskList;