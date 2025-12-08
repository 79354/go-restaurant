import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Layout() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="navbar-brand">RestaurantPro</div>
                <ul className="navbar-nav">
                    <li>
                        <Link 
                            to="/" 
                            className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/foods" 
                            className={`nav-link ${isActive('/foods') ? 'active' : ''}`}
                        >
                            Foods
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/menus" 
                            className={`nav-link ${isActive('/menus') ? 'active' : ''}`}
                        >
                            Menus
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/orders" 
                            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
                        >
                            Orders
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/tables" 
                            className={`nav-link ${isActive('/tables') ? 'active' : ''}`}
                        >
                            Tables
                        </Link>
                    </li>
                    <li>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;