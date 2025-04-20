import React, { useState, useEffect } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

function FoodList() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFoods();
    }, [page]);

    const fetchFoods = async () => {
        try{
            setLoading(true);
            const data = await api.getFoods({page, recordPerPage: 10});
            setFoods(data.food_items || [])
            setTotalPages(Math.ceil(data.total_count / 10));
            setLoading(false);
        }catch (err){
            setError('Failed to load foods');
            setLoading(false);
            console.error(err);
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this food item.")){
            try {
                await api.deleteFood(id);
                fetchFoods();
            }catch (err) {
                setError('Failed to delete food.');
                console.error(err);
            }
        }
    };

    const 
}