import { Navigate } from 'react-router-dom';

/**
 * Returns true when the token is absent, malformed, or past its `exp` claim.
 *
 * Checking presence alone let an expired token render the whole screen until the
 * first request came back 401, so the user saw a broken page before the bounce.
 * This is a UX guard only — the backend still validates every token.
 */
const isExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    if (!exp) return false; // no expiry claim: let the server decide
    return exp * 1000 <= Date.now();
  } catch {
    return true; // not a readable JWT
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (isExpired(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
