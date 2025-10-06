import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createAgent,
    getAllAgents,
    getAgentById,
    updateAgent,
    updateAgentStatus,
    deleteAgent
} from '../Controllers/AgentController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Agent routes
router.post('/create', createAgent);
router.get('/all', getAllAgents);
router.get('/:id', getAgentById);
router.put('/:id', updateAgent);
router.patch('/:id/status', updateAgentStatus);
router.delete('/:id', deleteAgent);

export default router;