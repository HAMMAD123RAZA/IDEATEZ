
// client/src/admin/TaskManagement/TaskFormModal.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaSave, FaPlusCircle, FaTrash } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { Timestamp } from 'firebase/firestore';
import NotificationModal from '../components/NotificationModal';

const TaskFormModal = ({ isOpen, onClose, onSave, task: existingTask, users: passedUsers, parentProjectInfo }) => {
  const { currentUser } = useAuth();
  const allUsersForAssign = passedUsers || []; 
  const usersLoading = !allUsersForAssign || allUsersForAssign.length === 0;

  const initialSubTaskState = useMemo(() => ({
    title: '', description: '', 
    assignedTo: parentProjectInfo?.assignedTo || [], // Default from parent if creating sub-task
    status: 'not-started', priority: 'medium', 
    dueDate: '', startDate: '',
  }), [parentProjectInfo?.assignedTo]);

  const getInitialFormState = useCallback(() => {
    if (parentProjectInfo) { // If creating a sub-task
      return {
        creationType: 'task', // Sub-tasks are always 'task'
        clientId: parentProjectInfo.clientId || '',
        clientName: parentProjectInfo.clientName || '',
        actualClientId: parentProjectInfo.clientId || '',
        displayClientId: parentProjectInfo.clientUid || parentProjectInfo.clientId || '',
        projectName: '', // Not applicable for sub-task form itself
        title: '',       // Title for the new sub-task
        description: '',
        projectId: parentProjectInfo.id, // Link to parent project
        assignedTo: parentProjectInfo.assignedTo || [], // Default from parent
        status: 'not-started', 
        priority: 'medium',
        dueDate: '', 
        startDate: '',
        files: [], 
        subTasks: [], // Sub-tasks don't have further sub-tasks in this form
      };
    }
    // Default for new top-level task or project
    return {
      creationType: 'task', 
      clientId: '', clientName: '', actualClientId: '', displayClientId: '', 
      projectName: '', title: '', description: '', projectId: '', 
      assignedTo: [], status: 'not-started', priority: 'medium',
      dueDate: '', startDate: '', files: [], 
      subTasks: [initialSubTaskState], 
    };
  }, [initialSubTaskState, parentProjectInfo]);

  const [formData, setFormData] = useState(getInitialFormState());
  const [formError, setFormError] = useState('');
  
  const [modalNotification, setModalNotification] = useState({ show: false, title: '', message: '', type: 'info' });

  const displayModalNotification = (title, message, type = 'info') => {
    setModalNotification({ show: true, title, message, type });
  };
  
  const clients = useMemo(() => {
    if (!isOpen || usersLoading || !allUsersForAssign || allUsersForAssign.length === 0) return [];
    return allUsersForAssign.filter(user => user.roleId === 'client');
  }, [isOpen, usersLoading, allUsersForAssign]);

  const assignableUsers = useMemo(() => {
    if (!isOpen || usersLoading || !allUsersForAssign || allUsersForAssign.length === 0) return [];
    const rolesForAssignees = ['admin', 'developer', 'freelancer', 'editor', 'partner', 'manager'];
    return allUsersForAssign.filter(user => rolesForAssignees.includes(user.roleId));
  }, [isOpen, usersLoading, allUsersForAssign]);
  
  useEffect(() => {
    if (isOpen) {
        if (parentProjectInfo) {
          setFormData(getInitialFormState()); // Initialize for sub-task creation
        } else if (existingTask) { 
          const isProject = existingTask.isProject || false;
          const selectedClient = clients.find(c => c.id === existingTask.clientId);
          setFormData({
            creationType: isProject ? 'project' : 'task',
            clientId: existingTask.clientId || '',
            clientName: existingTask.clientName || selectedClient?.displayName || '',
            actualClientId: existingTask.clientId || '', 
            displayClientId: selectedClient?.uid || existingTask.clientId,
            projectName: isProject ? existingTask.name : '',
            title: !isProject ? existingTask.title : '',   
            description: existingTask.description || '',
            projectId: !isProject ? (existingTask.projectId || '') : '', 
            assignedTo: Array.isArray(existingTask.assignedTo) ? existingTask.assignedTo : [],
            status: existingTask.status || 'not-started',
            priority: existingTask.priority || 'medium',
            dueDate: existingTask.dueDate ? (existingTask.dueDate instanceof Date ? existingTask.dueDate.toISOString().split('T')[0] : String(existingTask.dueDate).split('T')[0]) : '',
            startDate: existingTask.startDate ? (existingTask.startDate instanceof Date ? existingTask.startDate.toISOString().split('T')[0] : String(existingTask.startDate).split('T')[0]) : '',
            files: Array.isArray(existingTask.files) ? existingTask.files.map(f => ({...f, uniqueKey: f.name + (f.timestamp?.seconds || Date.now()) + Math.random()})) : [],
            // For editing projects, subTasks are not directly editable here. They are managed in detail view.
            subTasks: isProject ? [] : [], // Keep empty or fetch if direct edit of subtasks is needed
          });
        } else { 
          setFormData(getInitialFormState());
        }
        setFormError('');
        setModalNotification({show: false, title:'', message:'', type:'info'});
    }
  }, [existingTask, isOpen, clients, getInitialFormState, parentProjectInfo]);


  const handleProjectAssigneeChange = (e) => {
    const selectedProjectAssignees = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => {
        const newFormData = { ...prev, assignedTo: selectedProjectAssignees };
        // If creating a project and defaulting sub-task assignees (though sub-task section is hidden for new projects now)
        // This logic might be more relevant if we re-introduce sub-task creation during project creation.
        // if (prev.creationType === 'project' && !existingTask) { 
        //     const updatedSubTasks = prev.subTasks.map(subTask => ({
        //         ...subTask,
        //         assignedTo: selectedProjectAssignees 
        //     }));
        //     newFormData.subTasks = updatedSubTasks;
        // }
        return newFormData;
    });
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newStatus = formData.status;

    if (name === "startDate" && value) {
        const selectedStartDate = new Date(value);
        const today = new Date();
        today.setHours(0,0,0,0); 
        if (selectedStartDate <= today) {
            newStatus = 'in-progress';
        }
    }
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value,
        status: (name === "startDate" && newStatus !== prev.status) ? newStatus : prev.status,
    }));

    if (name === "clientId" && value) {
        const selectedClient = clients.find(c => c.id === value); 
        if (selectedClient) {
            setFormData(prev => ({ 
                ...prev, 
                clientName: selectedClient.displayName,
                actualClientId: selectedClient.id, 
                displayClientId: selectedClient.uid   
            }));
        }
    }
    if (name === "creationType") {
        setFormData(prev => ({
            ...getInitialFormState(), 
            clientId: prev.clientId, // Keep client info if already selected
            clientName: prev.clientName,
            actualClientId: prev.actualClientId,
            displayClientId: prev.displayClientId,
            creationType: value,
             // If switching to task, ensure subTasks array is empty unless it's for sub-task creation
            subTasks: value === 'task' && !parentProjectInfo ? [] : prev.subTasks,
        }));
    }
  };
  
  // This handler is now only relevant if we decide to show sub-task forms during project editing
  const handleSubTaskChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedSubTasks = [...formData.subTasks];
    updatedSubTasks[index] = { 
        ...updatedSubTasks[index], 
        [name]: type === 'checkbox' ? checked : value 
    };

    if (name === "startDate" && value) {
        const selectedStartDate = new Date(value);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selectedStartDate <= today) {
            updatedSubTasks[index].status = 'in-progress';
        }
    }
    setFormData(prev => ({ ...prev, subTasks: updatedSubTasks }));
  };

  // This handler is now only relevant if we decide to show sub-task forms during project editing
  const handleAddSubTask = () => {
    setFormData(prev => ({
      ...prev,
      subTasks: [...prev.subTasks, { ...initialSubTaskState, assignedTo: prev.assignedTo }] 
    }));
  };

  // This handler is now only relevant if we decide to show sub-task forms during project editing
  const handleRemoveSubTask = (index) => {
    if (formData.subTasks.length <= 1 && formData.creationType === 'project' && !existingTask) {
        displayModalNotification('Info', 'A project must have at least one task definition if adding sub-tasks initially.', 'info');
        return;
    }
    const updatedSubTasks = formData.subTasks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, subTasks: updatedSubTasks }));
  };

  const handleMultiUserChange = (e, subTaskIndex = null) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    if (subTaskIndex !== null) { 
        const updatedSubTasks = [...formData.subTasks];
        updatedSubTasks[subTaskIndex].assignedTo = selectedOptions;
        setFormData(prev => ({ ...prev, subTasks: updatedSubTasks}));
    } else { 
        setFormData(prev => ({ ...prev, assignedTo: selectedOptions }));
    }
  };
  
  const handleFileSelectionChange = useCallback((e) => {
     const files = Array.from(e.target.files);
     if (files.length > 0) {
         displayModalNotification('Info', `${files.length} file(s) selected. File management is available after item creation/in detail view.`, 'info');
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!parentProjectInfo && !formData.actualClientId) { 
        setFormError('Please select a client.');
        return;
    }

    let payload;
    let subTasksToSave = []; // This will be empty for new projects as per new requirement

    if (formData.creationType === 'project' && !parentProjectInfo) { // Creating a top-level Project
        if (!formData.projectName.trim()) {
            setFormError('Project Name is required.');
            return;
        }
        payload = {
            name: formData.projectName.trim(), 
            description: formData.description?.trim() || '',
            clientId: formData.actualClientId, 
            clientName: formData.clientName,
            isProject: true,
            status: formData.status,
            priority: formData.priority,
            assignedTo: formData.assignedTo, 
            dueDate: formData.dueDate,
            startDate: formData.startDate,
            files: [], // Files managed in detail view
            createdBy: currentUser?.id || 'system', 
            subTaskIds: [] // Initialize with empty subTaskIds for new projects
        };
        // Sub-tasks are not added at the time of project creation anymore

    } else { // Creating a Task (either standalone or sub-task)
        if (!formData.title.trim()) {
            setFormError('Task Title is required.');
            return;
        }
        payload = {
            title: formData.title.trim(),
            description: formData.description?.trim() || '',
            clientId: parentProjectInfo ? parentProjectInfo.clientId : formData.actualClientId,
            clientName: parentProjectInfo ? parentProjectInfo.clientName : formData.clientName,
            isProject: false,
            projectId: parentProjectInfo ? parentProjectInfo.id : (formData.projectId || null), 
            status: formData.status,
            priority: formData.priority,
            assignedTo: formData.assignedTo,
            dueDate: formData.dueDate,
            startDate: formData.startDate,
            files: [], // Files managed in detail view
            createdBy: currentUser?.id || 'system',
        };
    }
    
    await onSave(payload, subTasksToSave); // Pass empty subTasksToSave for new projects
  };


  if (!isOpen) return null;

  let modalTitle = "Create New Item";
  if (existingTask) {
    modalTitle = existingTask.isProject ? `Edit Project: ${existingTask.name}` : `Edit Task: ${existingTask.title}`;
  } else if (parentProjectInfo) {
    modalTitle = `Add New Sub-Task to ${parentProjectInfo.name}`;
  }


  const renderTaskFields = (data, onChangeHandler, userChangeHandler, index = null, isSubTaskForm = false) => (
    <>
      {/* Show Task Title input if it's a sub-task form OR a standalone task form */}
      { (isSubTaskForm || (!isSubTaskForm && formData.creationType === 'task')) && (
        <div className="col-span-1 md:col-span-2">
            <label htmlFor={`title-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">
                {isSubTaskForm ? 'Sub-Task Title' : 'Task Title'} <span className="text-red-500">*</span>
            </label>
            <input type="text" name="title" id={`title-${index ?? 'main'}`} value={data.title} 
                   onChange={e => onChangeHandler(index, e)} required
                   className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"/>
        </div>
      )}

      <div className="col-span-1 md:col-span-2">
        <label htmlFor={`description-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea name="description" id={`description-${index ?? 'main'}`} value={data.description} onChange={e => onChangeHandler(index, e)} rows="2"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 resize-none"></textarea>
      </div>
      <div>
        <label htmlFor={`assignedTo-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Assigned To</label>
        <select multiple name="assignedTo" id={`assignedTo-${index ?? 'main'}`} value={data.assignedTo} onChange={e => userChangeHandler(e, index)} disabled={usersLoading}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 h-24">
          {usersLoading ? <option>Loading users...</option> : 
            assignableUsers.map(user => (
              <option key={user.id} value={user.id}>{user.displayName || user.email}</option>
            ))
          }
        </select>
      </div>
      <div>
        <label htmlFor={`status-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select name="status" id={`status-${index ?? 'main'}`} value={data.status} onChange={e => onChangeHandler(index, e)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500">
          <option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="canceled">Canceled</option>
        </select>
      </div>
      <div>
        <label htmlFor={`priority-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
        <select name="priority" id={`priority-${index ?? 'main'}`} value={data.priority} onChange={e => onChangeHandler(index, e)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </div>
      <div>
        <label htmlFor={`startDate-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
        <input type="date" name="startDate" id={`startDate-${index ?? 'main'}`} value={data.startDate} onChange={e => onChangeHandler(index, e)}
               className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"/>
      </div>
       <div>
        <label htmlFor={`dueDate-${index ?? 'main'}`} className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
        <input type="date" name="dueDate" id={`dueDate-${index ?? 'main'}`} value={data.dueDate} onChange={e => onChangeHandler(index, e)}
               className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"/>
      </div>
    </>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <NotificationModal
        show={modalNotification.show}
        onClose={() => setModalNotification(prev => ({ ...prev, show: false }))}
        title={modalNotification.title}
        message={modalNotification.message}
        type={modalNotification.type}
      />
      <div className="bg-gray-800 text-gray-100 p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-500">{modalTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {formError && <p className="text-red-400 mb-4 bg-red-900/30 p-3 rounded-md">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
            {!parentProjectInfo && ( // Client selection only if not creating a sub-task
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-1">Client <span className="text-red-500">*</span></label>
                        <select name="clientId" id="clientId" value={formData.actualClientId} onChange={handleChange} required disabled={usersLoading || !!existingTask}
                                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50">
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.displayName} ({client.uid || client.id})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Client ID (System)</label>
                        <input type="text" value={formData.displayClientId || ''} readOnly
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"/>
                    </div>
                </div>
            )}

            {/* Item Type Selection: Hide if creating sub-task or editing existing item */}
            {!existingTask && !parentProjectInfo && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Item Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" name="creationType" value="task" checked={formData.creationType === 'task'} onChange={handleChange} className="form-radio text-yellow-500 bg-gray-700"/>
                            <span className="ml-2">Standalone Task</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="creationType" value="project" checked={formData.creationType === 'project'} onChange={handleChange} className="form-radio text-yellow-500 bg-gray-700"/>
                            <span className="ml-2">Project</span>
                        </label>
                    </div>
                </div>
            )}
            
            {/* Project Specific Fields (only if creationType is 'project' and not creating a sub-task) */}
            {formData.creationType === 'project' && !parentProjectInfo && (
                <div className="p-4 border border-dashed border-yellow-600/50 rounded-md space-y-3 mt-3">
                    <h3 className="text-lg font-semibold text-yellow-400">Project Details</h3>
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Project Name <span className="text-red-500">*</span></label>
                        <input type="text" name="projectName" id="projectName" value={formData.projectName} onChange={handleChange} required disabled={!!existingTask && existingTask.isProject}
                               className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-700 pt-3 mt-3">
                         <div className="md:col-span-2 lg:col-span-3">
                            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-1">Project Description</label>
                            <textarea name="description" id="projectDescription" value={formData.description} onChange={handleChange} rows="2"
                                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 resize-none"></textarea>
                         </div>
                         <div>
                            <label htmlFor="projectAssignedTo" className="block text-sm font-medium text-gray-300 mb-1">Assign Project To</label>
                            <select multiple name="assignedTo" id="projectAssignedTo" value={formData.assignedTo} 
                                    onChange={handleProjectAssigneeChange} 
                                    disabled={usersLoading}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500 h-24">
                               {assignableUsers.map(user => ( <option key={user.id} value={user.id}>{user.displayName || user.email}</option>))}
                            </select>
                         </div>
                        <div><label htmlFor="projectStatus" className="block text-sm font-medium text-gray-300 mb-1">Project Status</label><select name="status" id="projectStatus" value={formData.status} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"><option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select></div>
                        <div><label htmlFor="projectPriority" className="block text-sm font-medium text-gray-300 mb-1">Project Priority</label><select name="priority" id="projectPriority" value={formData.priority} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                        <div><label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-300 mb-1">Project Start Date</label><input type="date" name="startDate" id="projectStartDate" value={formData.startDate} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/></div>
                        <div><label htmlFor="projectDueDate" className="block text-sm font-medium text-gray-300 mb-1">Project Due Date</label><input type="date" name="dueDate" id="projectDueDate" value={formData.dueDate} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"/></div>
                    </div>

                    {/* Sub-task section is hidden for new projects as per Point 3 */}
                    {/* If editing a project, sub-tasks are managed in detail view */}
                </div>
            )}
            
            {/* Task Specific Fields (either standalone task or sub-task creation) */}
            {formData.creationType === 'task' && (
                 <div className="p-4 border border-dashed border-blue-600/50 rounded-md space-y-3 mt-3">
                    <h3 className="text-lg font-semibold text-blue-400">{parentProjectInfo ? 'New Sub-Task Details' : 'Task Details'}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {renderTaskFields(formData, (idx, e) => handleChange(e), handleMultiUserChange, null, !!parentProjectInfo)}
                    </div>
                    {/* Link to Project ID: Only show for standalone tasks, not for sub-tasks (where it's auto-set) */}
                     {!parentProjectInfo && !existingTask && (
                        <div>
                            <label htmlFor="projectIdLink" className="block text-sm font-medium text-gray-300 mb-1">Link to Existing Project ID (Optional, e.g., PID-001)</label>
                            <input type="text" name="projectId" id="projectIdLink" value={formData.projectId} onChange={handleChange}
                                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-yellow-500 focus:border-yellow-500"/>
                        </div>
                     )}
                 </div>
            )}
            
            {/* Attachments: Only visible if not creating a sub-task (files for sub-tasks managed via sub-task detail view) */}
             {!parentProjectInfo && (
                <div>
                    <label htmlFor="taskModalFiles" className="block text-sm font-medium text-gray-400 mb-1">Attachments</label>
                    <input type="file" id="taskModalFiles" multiple onChange={handleFileSelectionChange}
                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700 cursor-pointer"/>
                    <p className="text-xs text-gray-500 mt-1">File management (upload/delete) is available in the detail view after creation/edit.</p>
                </div>
            )}


            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose}
                        className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">
                Cancel
                </button>
                <button type="submit"
                        disabled={usersLoading}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2 disabled:opacity-50">
                <FaSave /> {existingTask ? 'Save Changes' : (formData.creationType === 'project' && !parentProjectInfo ? 'Create Project' : 'Create Task')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

TaskFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  task: PropTypes.object, 
  users: PropTypes.array,
  parentProjectInfo: PropTypes.shape({ // For creating sub-tasks
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    clientId: PropTypes.string.isRequired,
    clientName: PropTypes.string.isRequired,
    clientUid: PropTypes.string, // UID of the client user
    assignedTo: PropTypes.array, // Assignees of the parent project
  })
};

export default TaskFormModal;