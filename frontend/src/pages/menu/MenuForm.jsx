import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { menuAPI } from "../../utils.api";

function MenuForm(){
    const { menuId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!menuId;

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        isAvailable: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(isEdit) {
            const fetchMenu = async () => {
                try{
                    setLoading(true);
                    const data = await menuAPI.getMenu(menuId);
                    setFormData({
                        name: data.name || "",
                        category: data.category || "",
                        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
                    });
                    setLoading(false);
                } catch(err) {
                    setError("Failed to load menu item");
                    setLoading(false);
                }
            }
            fetchMenu()
        }
    }, [menuId, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if(isEdit) {
                await menuAPI.updateMenu(menuId, formData);
            } else{
                await menuAPI.createMenu(formData);
            }
        }catch(err) {
            setError(isEdit ? "Failed to update menu" : "Failed to create menu");
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 className="list-header">{isEdit ? "Edit Menu Item" : "Create New Menu Item"}</h1> 

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="food-form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select a category</option>
                        <option value="appetizer">Appetizer</option>
                        <option value="main">Main Course</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                    </select>
                </div>

                <div className="form-group checkbox">
                    <input
                        id="isAvailable"
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                    />
                    <label htmlFor="isAvailable">Available</label>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Saving..." : isEdit ? "Update Menu" : "Create Menu"}
                    </button>
                    <button type="button" onClick={() => navigate("/menus")} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MenuForm;