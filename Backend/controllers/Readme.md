# Controllers

# 🔐 Authentication API

This section documents all the authentication-related API endpoints available in the backend.

**Controller Path:** `backend/controllers/authController.js`

---

## 📌 Base Route: `/api/auth`



### 1. **Register a New User**

- **Method:** `POST`
- **Endpoint:** `/register`
- **Access:** Public

#### ✅ Description:
Registers a new user. If an admin invite token is included and valid, the user is assigned the `admin` role.

#### 🔸 Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "adminInviteToken": "optional_admin_token"
}
```

#### 🔸 Success Response:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin | member",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "token": "jwt_token"
}
```

#### 🔸 Error Responses:

- `400 Bad Request`: **User already exists**
- `500 Internal Server Error`: **Server failure**

---

### 2. **Login User**

- **Method:** `POST`
- **Endpoint:** `/login`
- **Access:** Public

#### ✅ Description:
Authenticates a user using email and password, and returns a JWT token.

#### 🔸 Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 🔸 Success Response:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin | member",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "token": "jwt_token"
}
```

#### 🔸 Error Responses:

- `401 Unauthorized`: **Invalid email or password**
- `500 Internal Server Error`: **Server failure**

---

### 3. **Get User Profile**

- **Method:** `GET`
- **Endpoint:** `/profile`
- **Access:** Private (requires JWT)

#### ✅ Description:
Returns the authenticated user's profile (excluding the password).

#### 🔸  Headers:
```
Authorization: Bearer <jwt_token>
```

#### 🔸 Success Response:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin | member",
  "profileImageUrl": "https://example.com/avatar.jpg"
}
```

#### 🔸 Error Responses:

- `401 Unauthorized`: **Missing or invalid token**
- `404 Not Found`: **User not found**
- `500 Internal Server Error`: **Server failure**

---

### 4. **Update User Profile**

- **Method:** `PUT`
- **Endpoint:** `/profile`
- **Access:** Private (requires JWT)

#### ✅ Description:
Allows the authenticated user to update their name, email, and/or password.

#### 🔸  Headers:
```
Authorization: Bearer <jwt_token>
```

#### 🔸 Request Body (any combination):
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

#### 🔸 Success Response:
```json
{
  "_id": "user_id",
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "admin | member",
  "token": "new_jwt_token"
}
```

#### 🔸 Error Responses:

- `401 Unauthorized`: **Missing or invalid token**
- `404 Not Found`: **User not found**
- `500 Internal Server Error`: **Server failure**



# 📊 Report Controller API

This document covers the **Reports Export API Endpoints** for downloading task and user data as Excel files in a Task Management System.

**Controller File:** `backend/controllers/reportController.js`  
**Excel Library Used:** [exceljs](https://www.npmjs.com/package/exceljs)  
**Access Control:** Admin Only (requires JWT)

---

## 📁 Endpoints Overview

| Method | Endpoint                   | Description                     | Access      |
|--------|----------------------------|---------------------------------|-------------|
| GET    | `/api/reports/export/tasks`| Export all tasks in Excel format| Private (Admin) |
| GET    | `/api/reports/export/users`| Export user task summary report | Private (Admin) |

---

## 1️⃣ Export All Tasks Report

- **Method:** `GET`  
- **Endpoint:** `/api/reports/export/tasks`  
- **Access:** Private (Admin Only)

### ✅ Description:
Exports all tasks in the system into a downloadable Excel `.xlsx` file. Includes task title, description, priority, due date, status, and assigned users.

### 🔐 Headers:
```http
Authorization: Bearer <jwt_token>
```

#### 🔸 Responses:

- **File :** `tasks_report.xlsx`
- **Type :** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### 🔸 Error Response:
```json
{
  "message": "Error exporting tasks",
  "error": "<error details>"
}
```


## 2️⃣ Export Users Task Report

- **Method:** `GET`  
- **Endpoint:** `/api/reports/export/users`  
- **Access:** Private (Admin Only)

### ✅ Description:
Exports a summary report of all users and their task counts categorized by status (`Pending`, `In Progress`, `Completed`).

### 🔐 Headers:
```http
Authorization: Bearer <jwt_token>
```

#### 🔸 Responses:

- **File :** `users_report.xlsx`
- **Type :** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### 🔸 Error Response:
```json
{
  "message": "Error exporting tasks",
  "error": "<error details>"
}
```

# 📋 Task Controller API

This controller handles **Task Management** in the system.  
It supports CRUD operations, task status updates, checklist updates, and dashboard statistics for both **Admins** and **Users**.


## **Features**
- Create, Read, Update, Delete tasks
- Role-based access control:
  - **Admin**: Access all tasks
  - **User**: Access only assigned tasks
- Filter tasks by status
- Track task progress based on checklist completion
- Generate dashboard data (overall & user-specific)
- Support for multiple assigned users per task


## **API Endpoints**

### 1️⃣ Get All Tasks
**Route:** `GET /api/tasks`  
**Access:** Private (Admin: all tasks, User: only assigned tasks)  
**Query Params:**
| Param  | Type   | Required | Description |
|--------|--------|----------|-------------|
| status | String | No       | Filter tasks by status (`Pending`, `In Progress`, `Completed`) |

**Response:**
```json
{
  "tasks": [
    {
      "_id": "taskId",
      "title": "Task title",
      "status": "Pending",
      "completedTodoCount": 2,
      "assignedTo": [
        {
          "_id": "userId",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ]
    }
  ],
  "statusSummary": {
    "all": 10,
    "pendingTasks": 4,
    "inProgressTasks": 3,
    "completedTasks": 3
  }
}
```

### 2️⃣ Get Task by ID
**Route:** `GET /api/tasks/:id`<br>
**Access:** Private <br>
**Description:** Fetch a single task by its ID.


**Response:** Task object with populated `assignedTo` details.


### 3️⃣ Create Task (Admin Only)
**Route:** `POST /api/tasks`<br>
**Access:** Private <br>

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task details",
  "priority": "High",
  "dueDate": "2025-08-20",
  "assignedTo": ["userId1", "userId2"],
  "attachments": ["file1.png", "file2.pdf"],
  "todoChecklist": [
    { "text": "Subtask 1", "completed": false },
    { "text": "Subtask 2", "completed": false }
  ]
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": { ... }
}
```

### 4️⃣ Update Task

**Route:** `PUT /api/tasks/:id`  
**Access:** Private <br> 
**Description:**  Update task details.

**Response:**
```json
{
  "message": "Task updated successfully",
  "updatedTask": { ... }
}
```

### 5️⃣ Delete Task (Admin Only)

**Route:** `DELETE /api/tasks/:id`  
**Access:** Private (Admin only) <br> 

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### 6️⃣ Update Task Status

**Route:** `PUT /api/tasks/:id/status`  
**Access:** Private <br> 
**Description:**  
- Only Admin or assigned users can update status.
- If status is set to `"Completed"`, all checklist items are marked complete and progress is set to `100`.

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Response:**
```json
{
  "message": "Task status updated successfully",
  "updatedTask": { ... }
}
```

### 7️⃣ Update Task Checklist

**Route:** `PUT /api/tasks/:id/todo`  
**Access:** Private <br> 
**Description:** Updates the checklist and automatically updates: 
- Progress percentage
- Task status (`Pending`, `In Progress`, `Completed`)

**Request Body:**
```json
{
  "todoChecklist": [
    { "text": "Subtask 1", "completed": true },
    { "text": "Subtask 2", "completed": false }
  ]
}
```

**Response:**
```json
{
  "message": "Task checklist updated successfully",
  "task": { ... }
}
```

### 8️⃣ Get Dashboard Data (Admin Only)

**Route:** `GET /api/tasks/dashboard-data`  
**Access:** Private (Admin only) <br> 
**Description:** Returns: 
- Total, pending, completed, and overdue task counts
- Task distribution by status & priority
- Recent 10 tasks

### 9️⃣ Get User Dashboard Data

**Route:** `GET /api/tasks/user-dashboard-data`  
**Access:** Private (Logged-in user only) <br> 
**Description:** Same as Admin dashboard but data is specific to the logged-in user.

---
**Status Values :**
- `Pending`
- `In Progress`
- `Completed`

**Priority Levels :**
- `Low`
- `Medium`
- `High`


## Error Responses :

| Code | Message                   | 	Cause                     |
|--------|----------------------------|---------------------------------|
| 400   | assignedTo must be an array of user IDs| When assignedTo is not an array |
| 403    | You are not authorized to update this task| User is not admin or not assigned |
| 404    | Task not found| Invalid or missing task ID |
| 500    | Server error| Any server-side error |

--- 
<br>

# 👥 User Controller

This controller manages **user-related operations** including fetching all users with their task statistics and retrieving a single user by ID.

## Endpoints

### 1. Get All Users (Admin Only)
Fetches a list of all users (excluding their passwords) along with the count of tasks assigned to them by status (`Pending`, `In Progress`, `Completed`).

**Route:** `GET /api/users/`

**Access:**  
- Private (Admin role only)
- Requires valid JWT token
- User must have `role: "admin"`

**Logic:**  
- Retrieves all users from the database without passwords.
- For each user, counts tasks assigned to them based on status:
  - **pendingTask** → Number of tasks with status `"Pending"`
  - **inProgressTask** → Number of tasks with status `"In Progress"`
  - **completedTask** → Number of tasks with status `"completed"`
- Returns an array of user objects with these additional fields.

**Sample Response:**
```json
[
  {
    "_id": "64f2b8c123456789abcdef12",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "pendingTask": 3,
    "inProgressTask": 2,
    "completedTask": 5
  }
]
```


### 2. Get User by ID
Fetches a single user's details (excluding the password) based on their ID.

**Route:** `GET /api/users/:id`

**Access:**  
- Private (Requires JWT)

**Logic:**  
- Looks up the user in the database by `req.params.id`.
- If found, returns the user data (excluding password).
- If not found, returns a `404` error.

**Sample Response:**
```json
{
  "_id": "64f2b8c123456789abcdef12",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "user"
}
```

**Error Responses:**
```json
{
  "message": "User not found"
}
```
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Related Models

- User Model (`models/User.js`) → Stores user information.
- Task Model (`models/Task.js`) → Stores task details assigned to users.