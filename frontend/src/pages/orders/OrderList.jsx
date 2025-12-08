import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../utils/api";

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getOrders(currentPage, recordPerPage);
            setOrders(response.data || response || []);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                await orderAPI.deleteOrder(id);
                fetchOrders();
            } catch (err) {
                setError("Failed to delete order");
            }
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

    if (loading && orders.length === 0) {
        return (
            <div className="container">
                <div className="loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="list-header">
                <h2>Orders</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No orders found</h3>
                    <p>Orders will appear here once created</p>
                </div>
            ) : (
                <div className="menu-list">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Table ID</th>
                                    <th>Order Date</th>
                                    <th>Status</th>
                                    <th>Payment Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.order_id || order._id}>
                                        <td>{order.order_id || order._id}</td>
                                        <td>{order.table_id || "N/A"}</td>
                                        <td>{formatDate(order.order_date)}</td>
                                        <td>
                                            <span className={`status ${getStatusClass(order.status)}`}>
                                                {order.status || "PENDING"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status ${getStatusClass(order.payment_status)}`}>
                                                {order.payment_status || "PENDING"}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button 
                                                className="btn-edit" 
                                                onClick={() => navigate(`/orders/${order.order_id || order._id}`)}
                                            >
                                                View
                                            </button>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => handleDelete(order.order_id || order._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button 
                            onClick={() => setCurrentPage(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderList;