import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../Components/Header';
import Card from '../Components/Card';
import Items from '../Components/Items';
import { agentAPI, taskAPI } from '../utils/api';
import '../App.css';

function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [tabClick, setTabClick] = useState(false); // false - Agents, true - Tasks
    const [agentForm, setAgentForm] = useState({ name: '', email: '', phone: '', password: '', countryCode: '+1' });
    const [agentData, setAgentData] = useState([]);
    const [formClick, setFormClick] = useState(false);
    const [taskData, setTaskData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Redirect to login if not authenticated

    const addAgent = async (e) => {
        e.preventDefault();
        if (!agentForm.name || !agentForm.email || !agentForm.phone || !agentForm.password) {
            alert('Please fill all fields');
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated) {
            alert('You must be logged in to create an agent');
            navigate('/');
            return;
        }
        
        setLoading(true);
        try {
            // Map frontend fields to backend expected fields
            const agentDataToSend = {
                name: agentForm.name,
                email: agentForm.email,
                mobileNumber: agentForm.phone, // Map phone to mobileNumber
                countryCode: agentForm.countryCode,
                password: agentForm.password
            };
            
            console.log('Sending agent data:', agentDataToSend);
            console.log('User authenticated:', isAuthenticated);
            const response = await agentAPI.createAgent(agentDataToSend);
            console.log('Agent creation response:', response);
            
            if (response.success) {
                setAgentData([...agentData, response.data.agent]);
                setAgentForm({ name: '', email: '', phone: '', password: '', countryCode: '+1' });
                setFormClick(false);
                alert('Agent Added Successfully');
            } else {
                alert(response.message || 'Error creating agent');
            }
        } catch (error) {
            console.error('Agent creation error:', error);
            alert('Error creating agent: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setError('');
        setTaskData([]);
        if (!file) return;
        
        const allowedExtensions = ['csv', 'xlsx', 'xls'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            setError('Invalid file type. Please upload a CSV, XLSX, or XLS file.');
            e.target.value = null;
            return;
        }

        setUploading(true);
        try {
            const response = await taskAPI.uploadTasks(file);
            if (response.success) {
                setTaskData(response.data.tasksByAgent);
                alert(response.message);
            } else {
                setError(response.message || 'Error uploading file');
            }
        } catch (error) {
            setError('Error uploading file: ' + error.message);
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    // Load agents on component mount
    useEffect(() => {
        if (isAuthenticated) {
            loadAgents();
        }
    }, [isAuthenticated]);

    const loadAgents = async () => {
        try {
            const response = await agentAPI.getAllAgents();
            if (response.success) {
                setAgentData(response.data.agents);
            } else {
                setError(response.message || 'Failed to load agents');
            }
        } catch (error) {
            setError('Error loading agents: ' + error.message);
        }
    };

    return (
        <div className='dashboard-page'>
            <Header />
            <div className="user-info">
                <p>Welcome, {user?.name || 'User'}!</p>
            </div>
            <div className="tab-btns">
                <button onClick={() => setTabClick(false)} className={`tab-btn ${!tabClick ? 'active' : ''}`}>Agents</button>
                <button onClick={() => setTabClick(true)} className={`tab-btn ${tabClick ? 'active' : ''}`}>Tasks</button>
            </div>

            {!tabClick ? (
                <div className="container">
                    <div className="add-agent">
                        <h1 style={{ margin: 0 }}>Agents {agentData.length > 0 ? `(${agentData.length})` : ''}</h1>
                        <button onClick={() => setFormClick(true)} className="btn btn-primary">Add agent</button>
                    </div>
                    {agentData.length === 0 ? (
                        <p style={{ color: 'var(--color-muted)' }}>No agents yet. Click “Add agent” to create one.</p>
                    ) : (
                        <Card data={agentData} setData={setAgentData} />
                    )}
                    
                    {formClick && (
                        <div className="modal-overlay" onClick={() => setFormClick(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <form className="add-agent-form" onSubmit={addAgent}>
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        value={agentForm.name}
                                        onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="+1"
                                            value={agentForm.countryCode}
                                            onChange={e => setAgentForm({ ...agentForm, countryCode: e.target.value })}
                                            style={{ width: '80px' }}
                                            required
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Enter Mobile"
                                            value={agentForm.phone}
                                            onChange={e => setAgentForm({ ...agentForm, phone: e.target.value })}
                                            style={{ flex: 1 }}
                                            required
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Enter Email"
                                        value={agentForm.email}
                                        onChange={e => setAgentForm({ ...agentForm, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Enter Password"
                                        value={agentForm.password}
                                        onChange={e => setAgentForm({ ...agentForm, password: e.target.value })}
                                        required
                                    />
                                    <div className='form-btns'>
                                        <button type="button" onClick={() => setFormClick(false)} className="btn btn-secondary">Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? 'Creating...' : 'Add Agent'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <div className="container">
                    <div className="add-tasks">
                        <h1 style={{ margin: 0 }}>Tasks {taskData.length > 0 ? `(${taskData.reduce((acc, a)=> acc + (a.tasks?.length||0), 0)})` : ''}</h1>
                        <input id="file-upload" type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" disabled={uploading} />
                    </div>
                    {uploading && <p style={{ color: 'var(--color-muted)' }}>Uploading and processing file...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {taskData.length > 0 ? (
                        <Items taskData={taskData} agentData={agentData} setAgentData={setAgentData} />
                    ) : (
                        <p style={{ color: 'var(--color-muted)' }}>No tasks distributed yet. Upload a CSV/XLSX to assign tasks to your agents.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
