const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');

//@desc  Export all tasks as Excel file
//@route GET /api/reports/export/tasks
//@access Private(Admin)
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tasks Report');

        worksheet.columns = [
            { header: 'Task ID', key: '_id', width: 25 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'dueDate', key: 'dueDate', width: 20 },
            { header: 'Started At', key: 'startedAt', width: 25 },
            { header: 'Completed At', key: 'completedAt', width: 25 },
            { header: 'Time Spent (Hours)', key: 'timeSpent', width: 20 },
            { header: 'Assigned To', key: 'assignedTo', width: 30 },
        ];

        let totalTimeSpentHours = 0;
        let completedTaskCountWithTime = 0;
        let statusCounts = { Pending: 0, "In Progress": 0, Completed: 0 };
        let priorityCounts = { Low: 0, Medium: 0, High: 0 };

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo
                .map((user) => `${user.name} (${user.email})`).join(", ");

            let actualStartedAt = task.startedAt || task.createdAt;
            let actualCompletedAt = task.completedAt || (task.status === 'Completed' ? task.updatedAt : null);
            
            let timeSpentStr = "N/A";
            if (task.status === "Completed" && actualCompletedAt) {
                let durationMs = new Date(actualCompletedAt) - new Date(actualStartedAt);
                let durationHrs = (durationMs / (1000 * 60 * 60)).toFixed(2);
                timeSpentStr = durationHrs;
                
                totalTimeSpentHours += parseFloat(durationHrs);
                completedTaskCountWithTime += 1;
            }

            statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
            priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;

            worksheet.addRow({
                _id: task._id.toString(),
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'N/A',
                startedAt: actualStartedAt ? new Date(actualStartedAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
                completedAt: actualCompletedAt ? new Date(actualCompletedAt).toISOString().replace('T', ' ').substring(0, 16) : 'N/A',
                timeSpent: timeSpentStr,
                assignedTo: assignedTo || "Unassigned",
            });
        });

        // Add Statistics Sheet
        const staticSheet = workbook.addWorksheet('Statistics');
        staticSheet.columns = [
            { header: 'Metric', key: 'metric', width: 35 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        
        staticSheet.addRow({ metric: 'Total Tasks', value: tasks.length });
        staticSheet.addRow({ metric: 'Pending Tasks', value: statusCounts['Pending'] || 0 });
        staticSheet.addRow({ metric: 'In Progress Tasks', value: statusCounts['In Progress'] || 0 });
        staticSheet.addRow({ metric: 'Completed Tasks', value: statusCounts['Completed'] || 0 });
        staticSheet.addRow({});
        staticSheet.addRow({ metric: 'High Priority', value: priorityCounts['High'] || 0 });
        staticSheet.addRow({ metric: 'Medium Priority', value: priorityCounts['Medium'] || 0 });
        staticSheet.addRow({ metric: 'Low Priority', value: priorityCounts['Low'] || 0 });
        staticSheet.addRow({});
        
        const avgTime = completedTaskCountWithTime > 0 ? (totalTimeSpentHours / completedTaskCountWithTime).toFixed(2) : "0.00";
        staticSheet.addRow({ metric: 'Average Time Spent (Hours)', value: avgTime });
        staticSheet.addRow({ metric: 'Total Time Spent (Hours)', value: totalTimeSpentHours.toFixed(2) });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="tasks_report.xlsx"`
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({ message: 'Error exporting tasks', error: error.message });
    }
};

//@desc  Export user task reports as Excel file
//@route GET /api/reports/export/users
//@access Private(Admin)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                totalTimeMs: 0,
                totalCompletedWithTime: 0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if (task.status === "Pending") {
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === "In Progress") {
                            userTaskMap[assignedUser._id].inProgressTasks += 1;
                        } else if (task.status === "Completed") {
                            userTaskMap[assignedUser._id].completedTasks += 1;

                            // Handle time tracking fallback
                            let actualStartedAt = task.startedAt || task.createdAt;
                            let actualCompletedAt = task.completedAt || task.updatedAt;
                            if (actualCompletedAt && actualStartedAt) {
                                let durationMs = new Date(actualCompletedAt) - new Date(actualStartedAt);
                                userTaskMap[assignedUser._id].totalTimeMs += durationMs;
                                userTaskMap[assignedUser._id].totalCompletedWithTime += 1;
                            }
                        }
                    }
                });
            }
        });

        let globalTaskAssignments = 0;
        let globalTimeMs = 0;
        let globalCompletedWithTime = 0;

        Object.values(userTaskMap).forEach(u => {
            u.totalTimeSpent = (u.totalTimeMs / (1000 * 60 * 60)).toFixed(2);
            u.averageTime = u.totalCompletedWithTime > 0 ? (u.totalTimeMs / u.totalCompletedWithTime / (1000 * 60 * 60)).toFixed(2) : "0.00";
            
            globalTaskAssignments += u.taskCount;
            globalTimeMs += u.totalTimeMs;
            globalCompletedWithTime += u.totalCompletedWithTime;
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users Task Report');

        worksheet.columns = [
            { header: 'User Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 40 },
            { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
            { header: 'Pending Tasks', key: 'pendingTasks', width: 20 },
            { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
            { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
            { header: 'Total Time Spent (Hours)', key: 'totalTimeSpent', width: 25 },
            { header: 'Average Time (Hours)', key: 'averageTime', width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        // Add Statistics Sheet for Users
        const staticSheet = workbook.addWorksheet('Statistics');
        staticSheet.columns = [
            { header: 'Metric', key: 'metric', width: 45 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        
        staticSheet.addRow({ metric: 'Total Team Members', value: users.length });
        staticSheet.addRow({ metric: 'Total Assigned Tasks (Across all users)', value: globalTaskAssignments });
        staticSheet.addRow({});
        
        const globalAvg = globalCompletedWithTime > 0 ? (globalTimeMs / globalCompletedWithTime / (1000 * 60 * 60)).toFixed(2) : "0.00";
        staticSheet.addRow({ metric: 'Average Time Spent per User Task (Hours)', value: globalAvg });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="users_report.xlsx"`
        );

        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(500).json({ message: 'Error exporting tasks', error: error.message });
    }
};

module.exports = { exportTasksReport, exportUsersReport };