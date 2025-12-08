import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Dashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalFoods: 0,
        totalTables: 0,
        totalMenus: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setTimeout(() => {
                setStats({
                    totalOrders: 0,
                    totalFoods: 0,
                    totalTables: 0,
                    totalMenus: 0
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="dashboard">
                <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>
                    Welcome back, {currentUser?.first_name || 'User'}! 👋
                </h1>

                <div className="stats-grid">
                    <Link to="/orders" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3>Total Orders</h3>
                            <div className="stat-value">{stats.totalOrders}</div>
                        </div>
                    </Link>

                    <Link to="/foods" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3>Food Items</h3>
                            <div className="stat-value">{stats.totalFoods}</div>
                        </div>
                    </Link>

                    <Link to="/tables" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3>Tables</h3>
                            <div className="stat-value">{stats.totalTables}</div>
                        </div>
                    </Link>

                    <Link to="/menus" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3>Menu Categories</h3>
                            <div className="stat-value">{stats.totalMenus}</div>
                        </div>
                    </Link>
                </div>

                <div style={{ 
                    backgroundColor: 'var(--surface-color)', 
                    padding: '2rem', 
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/foods/create" className="btn-add">Add New Food</Link>
                        <Link to="/menus/create" className="btn-add">Create Menu</Link>
                        <Link to="/tables" className="btn-primary">View Tables</Link>
                        <Link to="/orders" className="btn-primary">View Orders</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;