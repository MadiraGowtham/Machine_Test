import react, { useEffect } from 'react';
import logo from '../assets/image.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import { resetPassword as resetPasswordApi } from '../utils/auth';

function Login() {
    const [userData , setUserData] = react.useState({
        email: "",
        password: ""
    });
    const [error, setError] = react.useState('');
    const [loading, setLoading] = react.useState(false);
    const [resetOpen, setResetOpen] = react.useState(false);
    const [resetForm, setResetForm] = react.useState({ email: '', currentPassword: '', newPassword: '' });
    const [resetStatus, setResetStatus] = react.useState('');
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const checkLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const result = await login(userData.email, userData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const submitReset = async (e) => {
        e.preventDefault();
        setResetStatus('');
        try {
            const res = await resetPasswordApi(resetForm.email, resetForm.currentPassword, resetForm.newPassword);
            if (res.success) {
                setResetStatus('Password reset successfully. You can now log in.');
                setTimeout(() => setResetOpen(false), 1200);
            } else {
                setResetStatus(res.message || 'Password reset failed');
            }
        } catch (err) {
            setResetStatus('Network error. Please try again.');
        }
    }

    return(
        <div className='loginPage'>
            <div className='loginContainer'>
                <img src={logo} alt='logo' className='logo-img'/>
                <div className='loginForm'>
                    <h1 className='signin-title'>Sign In</h1>
                    {error && <div className='error-message' style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                    <form onSubmit={checkLogin}>
                        <input type='text' placeholder='Email' onChange={(e) => setUserData({ ...userData, email: e.target.value })} required/>
                        <input type='password' placeholder='Password' onChange={(e) => setUserData({ ...userData, password: e.target.value })} required/>
                        <button type='submit' disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <button type='button' className='link-btn' onClick={() => setResetOpen(true)}>Forgot password?</button>
                    </div>
                </div>
            </div>
            {resetOpen && (
                <div className='modal-overlay' onClick={() => setResetOpen(false)}>
                    <div className='modal-content' onClick={e => e.stopPropagation()}>
                        <form className='add-agent-form' onSubmit={submitReset}>
                            <h2 style={{ margin: 0 }}>Reset Password</h2>
                            <input type='email' placeholder='Email' value={resetForm.email} onChange={e => setResetForm({ ...resetForm, email: e.target.value })} required/>
                            <input type='password' placeholder='Current Password' value={resetForm.currentPassword} onChange={e => setResetForm({ ...resetForm, currentPassword: e.target.value })} required/>
                            <input type='password' placeholder='New Password' value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} required/>
                            {resetStatus && <div className='error-message' style={{ background: 'transparent', border: 'none', color: '#111827' }}>{resetStatus}</div>}
                            <div className='form-btns'>
                                <button type='button' className='btn btn-secondary' onClick={() => setResetOpen(false)}>Cancel</button>
                                <button type='submit' className='btn btn-primary'>Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;