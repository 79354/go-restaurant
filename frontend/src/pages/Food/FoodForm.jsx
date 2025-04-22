import React, { useState, useEffect } from "react";
import { useParams, useNavigate, UNSAFE_useFogOFWarDiscovery } from "react-router-dom";
import { foodAPI } from "../../utils/api";

function FoodForm(){
    const { foodId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!foodId;

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category_id: "",
        menu_id: "",
        isAvailable: true,
        image: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(isEdit) {
            foodAPI.getFood(foodId)
            .then(data => setFormData(data))
            .catch(() => setError("Failed to load food item"));
        }
    }, [foodId, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit) {
                await foodAPI.updateFood(foodId, formData)
            } else{
                await foodAPI.createFood(formData)
            }
        } catch (err) {
            setError("Failed to save food item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2 className="list-header">{isEdit ? "Edit Food Item" : "Create Food Item"}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="food-form">
                
            </form>
        </div>
    )
}