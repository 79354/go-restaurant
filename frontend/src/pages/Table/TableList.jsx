import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tableAPI } from "../../utils/api";

function TableList(){
    const [tables, setTables] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const recordPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchTable();
    }, [currentPage]);

    const fetchTable = async () => {
        try{
            setLoading(true);
            const response = await tableAPI.getTables(currentPage, recordPerPage);
            setTables(response || []);
            setTotalPages(response.totalPages || 1);
        }catch(err){
            setError("Failed to load menu items");
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        
    }

    const handleChange = async () => {

    }
}