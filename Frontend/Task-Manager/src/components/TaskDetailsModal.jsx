import React from 'react';
import moment from 'moment';
import Modal from './Modal';
import AvatarGroup from './AvatarGroup';

const TaskDetailsModal = ({ isOpen, onClose, task, onUpdateClick }) => {
    if (!task) return null;

    // Use updatedAt as a fallback for older completed tasks that don't have completedAt
    const actualCompletedAt = task.completedAt || (task.status === 'Completed' ? task.updatedAt : null);
    const actualStartedAt = task.startedAt || task.createdAt;

    const getStatusTagColor = (status) => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
            case "Completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/20";
            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Task Summary">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-gray-800">{task.title}</h4>
                    <div className={`text-[12px] font-medium ${getStatusTagColor(task.status)} px-3 py-1 rounded`}>
                        {task.status}
                    </div>
                </div>

                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {task.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500">Priority</label>
                        <p className="text-[13px] font-medium text-gray-800">{task.priority}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500">Created At</label>
                        <p className="text-[13px] font-medium text-gray-800">{moment(task.createdAt).format("Do MMM YYYY")}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500">Due Date</label>
                        <p className="text-[13px] font-medium text-gray-800">{task.dueDate ? moment(task.dueDate).format("Do MMM YYYY") : "N/A"}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500">Assigned To</label>
                        <AvatarGroup avatars={task.assignedTo?.map(user => user.profileImageUrl) || []} />
                    </div>
                </div>

                <div className="mt-4 border-t pt-4 border-gray-100">
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Sub Tasks / Checklists</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {task.todoChecklist && task.todoChecklist.length > 0 ? (
                            task.todoChecklist.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={item.completed} 
                                        readOnly 
                                        className="w-4 h-4 mt-0.5 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none" 
                                    />
                                    <span className={`text-[13px] ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {item.text}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[12px] text-gray-400">No sub-tasks added.</p>
                        )}
                    </div>
                </div>

                {task.status === "Completed" && (
                    <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-md grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500">Started At</label>
                            <p className="text-[12px] font-medium text-slate-700">{moment(actualStartedAt).format("Do MMM YYYY, h:mm a")}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Completed At</label>
                            <p className="text-[12px] font-medium text-slate-700">{actualCompletedAt ? moment(actualCompletedAt).format("Do MMM YYYY, h:mm a") : 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500">Time Spent</label>
                            <p className="text-[12px] font-semibold text-indigo-600">
                                {actualCompletedAt ? moment(actualCompletedAt).from(actualStartedAt, true) : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 mt-2">
                    <button 
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md text-[13px] font-medium transition-colors"
                        onClick={() => onUpdateClick(task)}
                    >
                        Update Task
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;
