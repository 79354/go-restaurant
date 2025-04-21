import React, { useState, useEffect } from "react";
import { useParam, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

function FoodForm() {
    const { foodId } = useParam();
    const navigate = useNavigate();
    const isEdit = !!foodId

    const [fromData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        menu_id: "",
        available: true,
        image: ""
    })

    useEffect( () => {
        if (isEdit) {
            api.getFood(foodId).then(setFormData).catch(console.error)
        }
    }, [foodId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData( prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.updateFood(foodId, formData)
            }
        }
    }
}