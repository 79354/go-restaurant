import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuAPI } from "../../utils/api";

function MenuList() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)
    const recordPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenus();
    }, [currentPage]);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const response = await menuAPI.getMenus(currentPage, recordPerPage);

            setMenus(response.data || []);
            // Assuming the API returns total pages information
            setTotalPages(response.totalPages || 1)
        }catch(err) {
            setError("Failed to load menu items");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this menu item?")) {
            try {
                await menuAPI.deleteMenu(id);
                fetchMenus();
            } catch (err) {
                setError("Failed to delete menu item");
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage < totalPages){
            setCurrentPage(newPage);
        }
    };
    if (loading && menus.length === 0) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            {error && <div className="error-message">{error}</div>}

            <div className="menu-list">
                <div className="list-header">
                    <h2>Menu Items</h2>
                    {/* Example: Add new menu button if needed */}
                    {/* <button className="btn-add" onClick={() => navigate("/add-menu")}>Add New</button> */}
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map((menu) => (
                                <tr key={menu._id}>
                                    <td>{menu.name}</td>
                                    <td>{menu.price}</td>
                                    <td>{menu.description}</td>
                                    <td className="actions">
                                        <button className="btn-edit" onClick={() => navigate(`/menu/edit/${menu._id}`)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(menu._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MenuForm;