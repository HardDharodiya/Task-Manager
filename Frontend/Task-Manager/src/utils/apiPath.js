export const BASE_URL = "http://localhost:8000";

//utils/apiPath.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",// Register a new user (Admin or Member)
        LOGIN: "/api/auth/login",// Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile",// Get logged-in user details
    },

    USERS: {
        GET_ALL_USERS: "/api/users", // GET ALL USERS (aDMIN ONLY)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user details by ID
        CREATE_USER: "/api/users", // Create a new user (Admin only)
        UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details by ID
        DELETE_USER: (userId) => `/api/users/${userId}`, // Delete user
    },

    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get dashboard data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get user dashboard data
        GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin: All, User: Assigned to them)
        GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
        CREATE_TASK: "/api/tasks", // Create a new task (Admin only)
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task by ID
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete task (Admin only)

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update task todo list
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", //Download all tasks as an Excell sheet
        EXPORT_USERS: "/api/reports/export/users", //Download user-task report
    },

    IMAGE: {
        UPLOAD_IMAGE: "api/auth/upload-image",
    }
}