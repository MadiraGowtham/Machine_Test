import { apiRequest } from './auth';

// Agent API functions
export const agentAPI = {
    // Create a new agent
    createAgent: async (agentData) => {
        try {
            console.log('Creating agent with data:', agentData);
            const response = await apiRequest('/agents/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentData)
            });
            
            console.log('Agent creation response status:', response?.status);
            if (response && response.ok) {
                const data = await response.json();
                console.log('Agent creation response data:', data);
                return data;
            } else {
                if (response) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    console.log('Agent creation error response:', errorData);
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                throw new Error('Failed to create agent - no response');
            }
        } catch (error) {
            console.error('Error creating agent:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all agents
    getAllAgents: async () => {
        try {
            console.log('Fetching all agents...');
            const response = await apiRequest('/agents/all', {
                method: 'GET'
            });
            
            console.log('Get agents response status:', response?.status, response?.statusText);
            
            if (!response) {
                throw new Error('No response received');
            }
            
            // Read the response body once
            const responseData = await response.text();
            console.log('Raw response data:', responseData);
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseData);
            } catch (parseError) {
                console.log('Failed to parse response as JSON:', parseError);
                throw new Error(`Invalid JSON response: ${responseData}`);
            }
            
            if (response.ok) {
                console.log('Get agents response data:', data);
                return data;
            } else {
                console.log('Response not ok, error data:', data);
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            console.error('Error details:', error.message);
            return { success: false, message: error.message };
        }
    },

    // Get agent by ID
    getAgentById: async (agentId) => {
        try {
            const response = await apiRequest(`/agents/${agentId}`);
            
            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to fetch agent');
            }
        } catch (error) {
            console.error('Error fetching agent:', error);
            return { success: false, message: error.message };
        }
    },

    // Update agent (full edit)
    updateAgent: async (agentId, agentData) => {
        try {
            // Align frontend fields to backend expectations
            const payload = {
                name: agentData.name,
                email: agentData.email,
                mobileNumber: agentData.phone || agentData.mobileNumber,
                countryCode: agentData.countryCode || '+1',
                // Only include password if provided
                ...(agentData.password ? { password: agentData.password } : {})
            };

            const response = await apiRequest(`/agents/${agentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = response && await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error((errorData && errorData.message) || 'Failed to update agent');
            }
        } catch (error) {
            console.error('Error updating agent:', error);
            return { success: false, message: error.message };
        }
    },

    // Update agent status
    updateAgentStatus: async (agentId, isActive) => {
        try {
            const response = await apiRequest(`/agents/${agentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive })
            });
            
            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to update agent status');
            }
        } catch (error) {
            console.error('Error updating agent status:', error);
            return { success: false, message: error.message };
        }
    },

    // Delete agent
    deleteAgent: async (agentId) => {
        try {
            const response = await apiRequest(`/agents/${agentId}`, {
                method: 'DELETE'
            });
            
            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to delete agent');
            }
        } catch (error) {
            console.error('Error deleting agent:', error);
            return { success: false, message: error.message };
        }
    }
};

// Task API functions
export const taskAPI = {
    // Upload CSV/XLSX file and distribute tasks
    uploadTasks: async (file) => {
        try {
            console.log('Preparing to upload file:', file.name);
            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending request to /tasks/upload...');
            const response = await apiRequest('/tasks/upload', {
                method: 'POST',
                body: formData
            });
            
            console.log('Upload response received:', response);
            
            if (response && response.ok) {
                const data = await response.json();
                console.log('Upload successful, data:', data);
                return data;
            } else {
                if (response) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    console.log('Upload failed, error data:', errorData);
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                throw new Error('Failed to upload tasks - no response');
            }
        } catch (error) {
            console.error('Error uploading tasks:', error);
            return { success: false, message: error.message };
        }
    },

    // Get tasks by agent
    getTasksByAgent: async (agentId) => {
        try {
            const response = await apiRequest(`/tasks/agent/${agentId}`);
            
            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to fetch tasks by agent');
            }
        } catch (error) {
            console.error('Error fetching tasks by agent:', error);
            return { success: false, message: error.message };
        }
    },

    // Get all tasks with agent details
    getAllTasksWithAgents: async () => {
        try {
            const response = await apiRequest('/tasks/all', {
                method: 'GET'
            });
            
            if (response && response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to fetch all tasks');
            }
        } catch (error) {
            console.error('Error fetching all tasks:', error);
            return { success: false, message: error.message };
        }
    }
};