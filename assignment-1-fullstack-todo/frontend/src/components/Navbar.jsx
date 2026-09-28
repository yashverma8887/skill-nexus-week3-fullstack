import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>⚡ FullStack To-Do</span>
      </Link>
      <div className="navbar-user">
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Welcome, <strong>{user.name}</strong>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
