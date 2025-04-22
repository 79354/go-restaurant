export const foodAPI = {
    getFoods: async ({ page = 1, recordPerPage = 10 }) => {
        const res = await fetch(`/api/foods/?page=${page}&recordPerPage=${recordPerPage}`);
        return res.json();
    },
    getFood: async (id) => {
        const res = await fetch(`/api/foods/${id}`);
        return res.json();
    },
    createFood: async (data) => {
        const res = await fetch(`/api/foods/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json();
    },
    updateFood: async (id, data) => {
        const res = await fetch(`/api/foods/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json();
    },
    deleteFood: async (id) => {
        const res = await fetch(`/api/foods/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

export const orderAPI = {
    getOrders: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`/api/orders/?page=${page}&recordPerPage=${recordPerPage}`);
        return res.json();
    },
    getOrder: async (id) => {
        const res = await fetch(`/api/orders/${id}`);
        return res.json();
    },

    createOrder: async (data) => {
        const res = await fetch(`/api/orders/`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    updateOrder: async (id, data) => {
        const res = await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json();
    },

    deleteOrder: async (id) => {
        const res = await fetch(`/api/orders/${id}`, {
            method: "DELETE",
        });
        return res.json();
    }
};

export const tableAPI = {
    getTables: async (currentPage = 1, recordPerPage = 10) => {
        const res = await fetch(`/api/tables/?page=${currentPage}&recordPerPage=${recordPerPage}`);
        return res.json();
    },

    getTable: async (id) => {
        const res = await fetch(`/api/tables/${id}`);
        return res.json();
    },

    createTable: async (data) => {
        const res = await fetch(`/api/tables/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateTable: async (id, data) => {
        const res = await fetch(`/api/tables/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        return res.JSON();
    },

    deleteTable: async () => {
        const res = await fetch(`/api/tables/{$id}`, {
            method: "DELETE",
        })
        return res.json();
    }
}

export const userAPI = {

}

export const orderItemAPI = {

}

export const menuAPI = {
    getMenus: async (page = 1, recordPerPage = 10) => {
        const res = await fetch(`/api/menus/?page=${page}&recordPerPage=${recordPerPage}`);
        return res.json()
        
    },

    getMenu: async (id) => {
        const res = await fetch(`/api/menus/${id}`);
        return res.json()
    },

    createMenu: async (data) => {
        const res = await fetch(`/api/menus/`, {
            method: 'POST',
            header: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json()
    },

    updateMenu: async (id, data) => {
        const res = await fetch(`/api/menus/${id}`, {
            method: 'PATCH',
            header: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return res.json()
    },

    deleteMenu: async (id) => {
        const res = await fetch(`/api/menus/${id}`, {
            method: 'DELETE'
        });
        return res.json()
    },
}

export const invoiceAPI = {

}