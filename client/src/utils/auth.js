// Authentication utilities
const API_BASE_URL = 'http://localhost:3000/api';

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Basic token validation (check if it exists and has proper format)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch (error) {
        return false;
    }
};

// API request helper with authentication
export const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        ...options.headers
    };

    // Only set JSON content-type when body is not FormData and header not preset
    const isFormData = options && options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('API Request:', `${API_BASE_URL}${endpoint}`, 'Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    console.log('API Response:', response.status, response.statusText, 'URL:', `${API_BASE_URL}${endpoint}`);

    if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        window.location.href = '/';
        return response; // Return the response so calling code can handle it
    }

    return response;
};

// Login function
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setToken(data.data.token);
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
};

// Register function
export const register = async (name, email, phone, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setToken(data.data.token);
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: data.message || 'Registration failed' };
        }
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
};

// Logout function
export const logout = () => {
    removeToken();
    window.location.href = '/';
};

// Get user profile
export const getProfile = async () => {
    try {
        const response = await apiRequest('/auth/profile');
        
        if (response && response.ok) {
            const data = await response.json();
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: 'Failed to fetch profile' };
        }
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
};

// Reset password helper
export const resetPassword = async (email, currentPassword, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true, message: data.message || 'Password reset successfully' };
        }
        return { success: false, message: data.message || 'Password reset failed' };
    } catch (error) {
        return { success: false, message: 'Network error occurred' };
    }
};