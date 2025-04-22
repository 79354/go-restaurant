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

    return (
        <div className="container">
            <div className="list-header">
                <h2>Food Items</h2>
                <Link to="/foods/new" className="btn-add">Add Food</Link>
            </div>
    
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="food-list">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Description</th>
                                    <th>Available</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foods.map((food) => (
                                    <tr key={food.food_id}>
                                        <td>{food.name}</td>
                                        <td>${food.price.toFixed(2)}</td>
                                        <td>{food.description}</td>
                                        <td>
                                            <span className={`status ${food.available ? "active" : "inactive"}`}>
                                                {food.available ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button className="btn-edit" onClick={() => navigate(`/foods/edit/${food.food_id}`)}>Edit</button>
                                            <button className="btn-delete" onClick={() => handleDelete(food.food_id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    <div className="pagination">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                        <span>Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
    
}
export default FoodList;