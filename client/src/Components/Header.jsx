import React from 'react';
import logoutIcon from '../assets/logout.png';
import '../App.css';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const { logout } = useAuth();

    return (
        <div className="header">
            <img src='https://www.csquaretech.com/wp-content/uploads/2024/12/cslogo.png' alt='logo' className='logo-img1' />
            <div className='header-text' onClick={logout}>
                <img src={logoutIcon} alt='logout' className='logout' />
                <h2>Logout</h2>
            </div>
        </div>
    )
}

export default Header;
