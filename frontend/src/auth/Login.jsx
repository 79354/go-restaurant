import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation} from 'react-router-dom';

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handlerSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('')
            setLoading('')
            await login(email, password);
            navigate(from, { replace: true });
        } catch(error) {
            setError('Failed to log in. Please check your credentials');
        } finally{
            setLoading(false);
        }
    };

    return (
        
    )

}