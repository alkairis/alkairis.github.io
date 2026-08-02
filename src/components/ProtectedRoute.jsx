import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../api/api';

// Gate for the admin area. Redirects to the (URL-only) login page when the
// visitor has no stored API key.
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/sign-me" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
