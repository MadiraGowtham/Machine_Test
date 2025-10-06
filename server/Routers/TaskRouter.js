import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    uploadAndDistributeTasks,
    getTasksByAgent,
    getAllTasksWithAgents
} from '../Controllers/TaskController.js';
import { upload } from '../Controllers/TaskController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Task routes
router.post('/upload', upload.single('file'), uploadAndDistributeTasks);
router.get('/agent/:agentId', getTasksByAgent);
router.get('/all', getAllTasksWithAgents);

export default router;