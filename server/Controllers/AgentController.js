import Agent from '../models/Agent.js';
import bcrypt from 'bcryptjs';

// Create a new agent
export const createAgent = async (req, res) => {
    try {
        const { name, email, mobileNumber, countryCode, password } = req.body;
        const adminId = req.user.userId; // From auth middleware

        // Check if agent already exists
        const existingAgent = await Agent.findOne({ email });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'Agent with this email already exists'
            });
        }

        // Create new agent
        const newAgent = new Agent({
            name,
            email,
            mobileNumber,
            countryCode: countryCode || '+1',
            password,
            createdBy: adminId
        });

        await newAgent.save();

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: {
                agent: {
                    id: newAgent._id,
                    name: newAgent.name,
                    email: newAgent.email,
                    mobileNumber: newAgent.mobileNumber,
                    countryCode: newAgent.countryCode,
                    isActive: newAgent.isActive,
                    assignedTasksCount: newAgent.assignedTasksCount
                }
            }
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating agent',
            error: error.message
        });
    }
};

// Update an agent (full edit)
export const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const { name, email, mobileNumber, countryCode, password } = req.body;

        const agent = await Agent.findOne({ _id: id, createdBy: adminId });
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        if (name !== undefined) agent.name = name;
        if (email !== undefined) agent.email = email;
        if (mobileNumber !== undefined) agent.mobileNumber = mobileNumber;
        if (countryCode !== undefined) agent.countryCode = countryCode || '+1';

        // Update password only if provided and non-empty
        if (password && password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            agent.password = await bcrypt.hash(password, salt);
        }

        await agent.save();

        const { password: _, ...agentSafe } = agent.toObject();

        res.status(200).json({
            success: true,
            message: 'Agent updated successfully',
            data: { agent: agentSafe }
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating agent',
            error: error.message
        });
    }
};

// Get all agents (for admin)
export const getAllAgents = async (req, res) => {
    try {
        const adminId = req.user.userId;
        
        const agents = await Agent.find({ createdBy: adminId })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { agents }
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agents',
            error: error.message
        });
    }
};

// Get agent by ID
export const getAgentById = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const agent = await Agent.findOne({ _id: id, createdBy: adminId })
            .select('-password');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { agent }
        });
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agent',
            error: error.message
        });
    }
};

// Update agent status
export const updateAgentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const adminId = req.user.userId;

        const agent = await Agent.findOneAndUpdate(
            { _id: id, createdBy: adminId },
            { isActive },
            { new: true }
        ).select('-password');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Agent status updated successfully',
            data: { agent }
        });
    } catch (error) {
        console.error('Error updating agent status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating agent status',
            error: error.message
        });
    }
};

// Delete agent
export const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const agent = await Agent.findOneAndDelete({ 
            _id: id, 
            createdBy: adminId 
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Agent deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting agent',
            error: error.message
        });
    }
};