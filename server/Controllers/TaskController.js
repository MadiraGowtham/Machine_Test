import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import Tasks from '../models/Tasks.js';
import Agent from '../models/Agent.js';

// Ensure upload directory exists
const UPLOAD_DIR = 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR + '/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV, XLSX, and XLS files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload and process CSV/XLSX file
export const uploadAndDistributeTasks = async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('User:', req.user);
        console.log('File info:', req.file);
        
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const adminId = req.user.userId;
        const filePath = req.file.path;
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        
        let tasks = [];

        // Parse file based on type
        if (fileExtension === 'csv') {
            tasks = await parseCSV(filePath);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            tasks = await parseExcel(filePath);
        }

        // Validate tasks
        if (tasks.length === 0) {
            fs.unlinkSync(filePath); // Clean up file
            return res.status(400).json({
                success: false,
                message: 'No valid tasks found in the file'
            });
        }

        // Get active agents created by this admin
        const agents = await Agent.find({ 
            createdBy: adminId, 
            isActive: true 
        }).select('_id name');

        if (agents.length === 0) {
            fs.unlinkSync(filePath); // Clean up file
            return res.status(400).json({
                success: false,
                message: 'No active agents found. Please create agents first.'
            });
        }

        // Distribute tasks among agents
        const distributedTasks = distributeTasks(tasks, agents);

        // Save tasks to database
        const savedTasks = await Tasks.insertMany(distributedTasks);

        // Update agent task counts
        await updateAgentTaskCounts(agents, distributedTasks);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        // Group tasks by agent for response
        const tasksByAgent = groupTasksByAgent(savedTasks, agents);

        res.status(200).json({
            success: true,
            message: `Successfully uploaded and distributed ${tasks.length} tasks among ${agents.length} agents`,
            data: {
                totalTasks: tasks.length,
                agentsCount: agents.length,
                tasksByAgent: tasksByAgent
            }
        });

    } catch (error) {
        console.error('Error processing file:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error processing file',
            error: error.message
        });
    }
};

// Parse CSV file
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const tasks = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Validate required fields
                if (row.FirstName && row.Phone) {
                    tasks.push({
                        FirstName: row.FirstName.trim(),
                        Phone: row.Phone.trim(),
                        Notes: row.Notes ? row.Notes.trim() : '',
                        assignedAgentId: null
                    });
                }
            })
            .on('end', () => {
                resolve(tasks);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Parse Excel file
const parseExcel = (filePath) => {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const tasks = data.map(row => {
            if (row.FirstName && row.Phone) {
                return {
                    FirstName: String(row.FirstName).trim(),
                    Phone: String(row.Phone).trim(),
                    Notes: row.Notes ? String(row.Notes).trim() : '',
                    assignedAgentId: null
                };
            }
            return null;
        }).filter(task => task !== null);

        return tasks;
    } catch (error) {
        throw new Error('Error parsing Excel file: ' + error.message);
    }
};

// Distribute tasks equally among agents
const distributeTasks = (tasks, agents) => {
    const distributedTasks = [];
    const tasksPerAgent = Math.floor(tasks.length / agents.length);
    const remainder = tasks.length % agents.length;
    
    let taskIndex = 0;
    
    agents.forEach((agent, agentIndex) => {
        const tasksForThisAgent = tasksPerAgent + (agentIndex < remainder ? 1 : 0);
        
        for (let i = 0; i < tasksForThisAgent; i++) {
            if (taskIndex < tasks.length) {
                const task = { ...tasks[taskIndex] };
                task.assignedAgentId = agent._id;
                distributedTasks.push(task);
                taskIndex++;
            }
        }
    });
    
    return distributedTasks;
};

// Update agent task counts
const updateAgentTaskCounts = async (agents, tasks) => {
    const taskCounts = {};
    
    // Count tasks per agent
    tasks.forEach(task => {
        if (task.assignedAgentId) {
            taskCounts[task.assignedAgentId] = (taskCounts[task.assignedAgentId] || 0) + 1;
        }
    });
    
    // Update each agent's task count
    for (const agentId of Object.keys(taskCounts)) {
        await Agent.findByIdAndUpdate(agentId, {
            $inc: { assignedTasksCount: taskCounts[agentId] }
        });
    }
};

// Group tasks by agent for response (shape aligns with frontend Items.jsx)
const groupTasksByAgent = (tasks, agents) => {
    const tasksByAgent = {};

    agents.forEach(agent => {
        tasksByAgent[agent._id.toString()] = {
            agent: {
                id: agent._id,
                name: agent.name
            },
            tasks: []
        };
    });

    tasks.forEach(task => {
        const key = task.assignedAgentId ? task.assignedAgentId.toString() : null;
        if (key && tasksByAgent[key]) {
            tasksByAgent[key].tasks.push({
                id: task._id,
                FirstName: task.FirstName,
                Phone: task.Phone,
                Notes: task.Notes
            });
        }
    });

    return Object.values(tasksByAgent);
};

// Get tasks by agent
export const getTasksByAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const adminId = req.user.userId;
        
        // Verify the agent belongs to this admin
        const agent = await Agent.findOne({ _id: agentId, createdBy: adminId });
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }
        
        const tasks = await Tasks.find({ assignedAgentId: agentId })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: {
                agent: {
                    id: agent._id,
                    name: agent.name,
                    email: agent.email
                },
                tasks: tasks
            }
        });
    } catch (error) {
        console.error('Error fetching tasks by agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
};

// Get all tasks with agent details
export const getAllTasksWithAgents = async (req, res) => {
    try {
        const adminId = req.user.userId;
        
        // Get all agents created by this admin
        const agents = await Agent.find({ createdBy: adminId })
            .select('_id name email');
        
        const agentIds = agents.map(agent => agent._id);
        
        // Get all tasks assigned to these agents
        const tasks = await Tasks.find({ assignedAgentId: { $in: agentIds } })
            .populate('assignedAgentId', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: { tasks }
        });
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
};

export { upload };