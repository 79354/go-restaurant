import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { foodAPI, menuAPI } from "../../utils/api";

function FoodForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category_id: "",
        menu_id: "",
        available: true,
        image: "",
    });

    const [menus, setMenus] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMenus();
        if (isEdit) {
            fetchFood();
        }
    }, [id, isEdit]);

    const fetchMenus = async () => {
        try {
            const data = await menuAPI.getMenus();
            setMenus(data || []);
        } catch (err) {
            console.error("Failed to load menus:", err);
        }
    };

    const fetchFood = async () => {
        try {
            setLoading(true);
            const data = await foodAPI.getFood(id);
            setFormData({
                name: data.name || "",
                price: data.price || "",
                description: data.description || "",
                category_id: data.category_id || "",
                menu_id: data.menu_id || "",
                available: data.available !== undefined ? data.available : true,
                image: data.image || "",
            });
        } catch (err) {
            setError("Failed to load food item");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (isEdit) {
                await foodAPI.updateFood(id, submitData);
            } else {
                await foodAPI.createFood(submitData);
            }
            navigate("/foods");
        } catch (err) {
            setError("Failed to save food item");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="list-header">{isEdit ? "Edit Food Item" : "Create Food Item"}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="food-form">
                <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter food name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Enter food description"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category_id">Category *</label>
                    <input
                        id="category_id"
                        type="text"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                        placeholder="Enter category ID"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="menu_id">Menu *</label>
                    <select
                        id="menu_id"
                        name="menu_id"
                        value={formData.menu_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a menu</option>
                        {menus.map((menu) => (
                            <option key={menu.menu_id} value={menu.menu_id}>
                                {menu.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <input
                        id="image"
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                    />
                </div>

                <div className="form-group checkbox">
                    <input
                        id="available"
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleChange}
                    />
                    <label htmlFor="available">Available</label>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Saving..." : isEdit ? "Update Food" : "Create Food"}
                    </button>
                    <button type="button" onClick={() => navigate("/foods")} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FoodForm;