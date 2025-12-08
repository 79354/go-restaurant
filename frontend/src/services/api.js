const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const foodAPI = {
    getFoods: async ({ page = 1, recordPerPage = 10 } = {}) => {
        const res = await fetch(`${API_BASE_URL}/foods?page=${page}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getFood: async (id) => {
        const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    createFood: async (data) => {
        const res = await fetch(`${API_BASE_URL}/foods`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateFood: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteFood: async (id) => {
        const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

export const orderAPI = {
    getOrders: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`${API_BASE_URL}/orders?page=${page}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getOrder: async (id) => {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    createOrder: async (data) => {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateOrder: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteOrder: async (id) => {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

export const tableAPI = {
    getTables: async (currentPage = 1, recordPerPage = 10) => {
        const res = await fetch(`${API_BASE_URL}/tables?page=${currentPage}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getTable: async (id) => {
        const res = await fetch(`${API_BASE_URL}/tables/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    createTable: async (data) => {
        const res = await fetch(`${API_BASE_URL}/tables`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },
    updateTable: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/tables/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },
    deleteTable: async (id) => {
        const res = await fetch(`${API_BASE_URL}/tables/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

export const menuAPI = {
    getMenus: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`${API_BASE_URL}/menus?page=${page}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getMenu: async (id) => {
        const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    createMenu: async (data) => {
        const res = await fetch(`${API_BASE_URL}/menus`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateMenu: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteMenu: async (id) => {
        const res = await fetch(`${API_BASE_URL}/menus/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    },
};

export const userAPI = {
    getUsers: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`${API_BASE_URL}/users?page=${page}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getUser: async (id) => {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

export const invoiceAPI = {
    getInvoices: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`${API_BASE_URL}/invoices?page=${page}&recordPerPage=${recordPerPage}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    getInvoice: async (id) => {
        const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
            headers: getAuthHeaders()
        });
        return res.json();
    },
    createInvoice: async (data) => {
        const res = await fetch(`${API_BASE_URL}/invoices`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateInvoice: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    }
};

// Re-export for backward compatibility
export const api = foodAPI;