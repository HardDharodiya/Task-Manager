import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { LuCross } from "react-icons/lu";

const UserDetailsModal = ({ isOpen, onClose, user, userInfo }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    console.log("User Info:", userInfo);

    useEffect(() => {
        if (isOpen && user?._id) {
            fetchUserTasks();
        }
    }, [isOpen, user]);

    const fetchUserTasks = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(
                `${API_PATHS.TASKS.GET_TASK_BY_USER}/${user._id}`
            );

            const userTasks = response.data.filter(task =>
                task.assignedTo?.includes(user._id)
            );

            setTasks(userTasks);
        } catch (error) {
            console.error("Failed to fetch user tasks", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === "Pending").length,
        inProgress: tasks.filter(t => t.status === "In Progress").length,
        completed: tasks.filter(t => t.status === "Completed").length,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <LuCross className="rotate-45 text-black" size={20} />
                </button>

                {/* User Info */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img
                            src={userInfo?.profileImageUrl}
                            alt={`Avatar`}
                            className='w-12 h-12 rounded-full border border-white'
                        />

                        <div>
                            <p className='text-sm font-medium'>{userInfo?.name}</p>
                            <p className='text-xs text-gray-500'>{userInfo?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className='flex items-end gap-3 mt-5'>
                    <StatCard
                        label="Pending"
                        count={userInfo?.pendingTask || 0}
                        status="Pending"
                    />
                    <StatCard
                        label="In Progress"
                        count={userInfo?.inProgressTask || 0}
                        status="In Progress"
                    />
                    <StatCard
                        label="Completed"
                        count={userInfo?.completedTask || 0}
                        status="Completed"
                    />
                </div>

                {/* Tasks */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-gray-500">No tasks assigned</p>
                    ) : (
                        tasks.map(task => (
                            <TaskRow key={task._id} task={task} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;

/* ---------- Sub Components ---------- */

const StatCard = ({ label, count, status, }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case 'In Progress':
                return "text-cyan-500 bg-gray-50";
            case 'Completed':
                return "text-indigo-500 bg-gray-50";
            default:
                return "text-violet-500 bg-gray-50";
        }
    }

    return (
        <div className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}>
            <span className='text-[12px] font-semibold'>{count}</span> <br /> {label}
        </div>
    )
}

const TaskRow = ({ task }) => {
    const getStatusColor = () => {
        switch (task.status) {
            case "Completed":
                return "text-green-600 bg-green-50";
            case "In Progress":
                return "text-blue-600 bg-blue-50";
            default:
                return "text-orange-600 bg-orange-50";
        }
    };

    return (
        <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor()}`}>
                {task.status}
            </span>
        </div>
    );
};
