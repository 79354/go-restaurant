import React from 'react'
import {Navigate, useLocation} from 'react-router-dom';
import { useAuth } from './AuthContext';

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from:location }} replace />;
    }

    return children;
}

export default PrivateRoute;