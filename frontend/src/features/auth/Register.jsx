import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';
import AuthBrandPanel from './AuthBrandPanel';
import mark from '../../assets/mark.png';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setDone(true);
      // Registration does not return a token, so send them to sign in.
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        setError(Object.values(data.errors)[0]);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <AuthBrandPanel />

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-lockup">
            <img src={mark} alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span className="auth-brand-name" style={{ color: 'var(--fg)' }}>BudgetWise</span>
          </div>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">A starter set of categories comes with it.</p>

          {error && <div className="auth-error">{error}</div>}
          {done && <div className="auth-success">Account created. Taking you to sign in…</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                className="auth-control"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Omkar Jadhav"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                className="auth-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-password">Password</label>
              <div className="auth-password">
                <input
                  id="register-password"
                  className="auth-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                className="auth-control"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading || done}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
