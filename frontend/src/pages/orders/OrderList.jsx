import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../../utils/api";

function OrderList(){
    const [orders, setOrders] = useState([])
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
            setOrders(response.data || []);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError("Failed to load order items.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order item?")) {
            try {
                await orderAPI.deleteOrder(id);
                fetchOrders(); // Refresh list
            } catch (err) {
                setError("Failed to delete order item.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading && orders.length === 0) return <div className="container">Loading...</div>

    return (
        <div className="container">
            <h2 className="list-header">Orders</h2>
        
            {error && <div className="error-message">{error}</div>}

            <div className="menu-list">
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => {
                                <tr key={order._id}>

                                    <td>{order._id}</td>
                                    <td>{order.totalAmount}</td>
                                    <td>{order.customerName}</td>

                                    <td>
                                        <span className={`status ${order.status === "completed" ? "active" : "inactive"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-delete" onClick={handleDelete(order._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>

                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderList;