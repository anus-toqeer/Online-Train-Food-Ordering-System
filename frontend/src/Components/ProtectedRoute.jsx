import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
    console.log('ProtectedRoute checked, user:', user, 'allowedRole:', allowedRole);


  if (!user) {
        console.log('No user — redirecting to /login');
      return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;