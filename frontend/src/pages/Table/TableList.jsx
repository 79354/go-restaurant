import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tableAPI } from "../../utils/api";

function TableList() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
    }, [currentPage]);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const response = await tableAPI.getTables(currentPage, recordPerPage);
            setTables(response || []);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            setError("Failed to load tables");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this table?")) {
            try {
                await tableAPI.deleteTable(id);
                fetchTables();
            } catch (err) {
                setError("Failed to delete table");
            }
        }
    };

    const getStatusClass = (status) => {
        if (status === "AVAILABLE") return "active";
        if (status === "OCCUPIED") return "inactive";
        return "";
    };

    if (loading && tables.length === 0) {
        return (
            <div className="container">
                <div className="loading">Loading tables...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="list-header">
                <h2>Tables</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            {tables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🪑</div>
                    <h3>No tables found</h3>
                    <p>Create your first table to get started</p>
                </div>
            ) : (
                <div className="food-list">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Table Number</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tables.map((table) => (
                                    <tr key={table.table_id}>
                                        <td>#{table.table_number}</td>
                                        <td>{table.capacity} people</td>
                                        <td>
                                            <span className={`status ${getStatusClass(table.status)}`}>
                                                {table.status}
                                            </span>
                                        </td>
                                        <td>{table.location || "N/A"}</td>
                                        <td className="actions">
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => handleDelete(table.table_id)}
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

export default TableList;