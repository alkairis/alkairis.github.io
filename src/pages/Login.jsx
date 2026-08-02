import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { login, isAuthenticated } from '../api/api';
import '../admin/admin.css';

// URL-only login page (/sign-me). Not linked anywhere in the public UI.
const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip straight to the admin area.
  if (isAuthenticated()) {
    return <Navigate to="/admin-me" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate('/admin-me', { replace: true });
    } catch (err) {
      const status = err?.status;
      setError(
        status === 401
          ? 'Invalid username or password.'
          : err?.message || 'Unable to sign in right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h1>Admin Sign In</h1>
        <p className="admin-sub">Sign in to manage portfolio content.</p>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="admin-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            autoFocus
          />
        </div>

        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="admin-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••••"
          />
        </div>

        <button className="admin-btn admin-btn-full" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
