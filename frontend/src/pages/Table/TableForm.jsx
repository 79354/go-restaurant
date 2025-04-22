import React, { useState, useEffect } from "react";
import { useNavigate, useParams} from "react-dom-router"
import { tableAPI } from "../../utils"

function TableForm() {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!tableId;

    const [formData, setFormData] = useState({
        tableNumber: "",
        capacity: 4,
        status: "AVAILABLE"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(isEdit){
            setLoading(true);
            tableAPI.getTable(tableId)
                .then(data => {
                    setFormData({
                        tableNumber: data.tableNumber,
                        capacity: data.capacity,
                        status: data.status
                    });
                })
                .catch(() => setError("Failed to load table"))
                .finally(() => setLoading(false));
        } else{
            tableAPI.getTables()
                .then((allTables) => {
                    const available = allTables.filter(t => t.status === "AVAILABLE");
                    if(available.length > 0){
                        const random = available[Math.floor(Math.random()* available.length)];
                        setFormData(prev => ({...prev, tableNumber: random.tableNumber}));
                    }
                })
                .catch(() => setError("Failed to assign available table"));
        }
    }, [tableId, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if(isEdit) {
                await tableAPI.updateTable(tableId, formData);
            }else{
                await tableAPI.createTable(formData);
            }
            navigate("/tables");
        } catch(err) {
            setError("Failed to save table")
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <h2 className="list-header">{isEdit ? "Edit Table": "Create Table"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="food-form"></form>
        </div>
    )
}