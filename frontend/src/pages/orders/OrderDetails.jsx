import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../../utils/api";

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getOrder(id);
            setOrder(data);
        } catch (err) {
            setError("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (status === "COMPLETED" || status === "PAID") return "active";
        if (status === "CANCELLED" || status === "FAILED") return "inactive";
        return "";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container">
                <div className="error-message">{error || "Order not found"}</div>
                <button className="btn-secondary" onClick={() => navigate("/orders")}>
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="list-header">
                <h2>Order Details</h2>
                <button className="btn-secondary" onClick={() => navigate("/orders")}>
                    Back to Orders
                </button>
            </div>

            <div style={{
                backgroundColor: 'var(--surface-color)',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem'
            }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Order Information</h3>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Order ID</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{order.order_id}</p>
                    </div>

                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Table ID</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{order.table_id || "N/A"}</p>
                    </div>

                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Order Date</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{formatDate(order.order_date)}</p>
                    </div>

                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status</p>
                        <span className={`status ${getStatusClass(order.status)}`}>
                            {order.status || "PENDING"}
                        </span>
                    </div>

                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Payment Status</p>
                        <span className={`status ${getStatusClass(order.payment_status)}`}>
                            {order.payment_status || "PENDING"}
                        </span>
                    </div>

                    {order.payment_method && (
                        <div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Payment Method</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{order.payment_method}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                backgroundColor: 'var(--surface-color)',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Order Items</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Order items details would be displayed here
                </p>
            </div>
        </div>
    );
}

export default OrderDetails;