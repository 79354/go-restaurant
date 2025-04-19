import React from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Login from './auth/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FoodList from './pages/food/FoodList';
import FoodForm from './pages/food/FoodForm';
import MenuList from './pages/menu/MenuList';
import MenuForm from './pages/menu/MenuForm';
import OrderList from './pages/orders/OrderList';
import OrderDetails from './pages/orders/OrderDetails';
import TableList from './pages/tables/TableList';
import PrivateRoute from './auth/PrivateRoute'

function App() {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
  
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
  
          {/* Food routes */}
          <Route path="foods" element={<FoodList />} />
          <Route path="foods/create" element={<FoodForm />} />
          <Route path="foods/edit/:id" element={<FoodForm />} />
  
          {/* Menu routes */}
          <Route path="menus" element={<MenuList />} />
          <Route path="menus/create" element={<MenuForm />} />
          <Route path="menus/edit/:id" element={<MenuForm />} />
  
          {/* Invoice routes */}
          <Route path="invoices/create" element={<InvoiceForm />} />
          <Route path="invoices/edit/:id" element={<InvoiceForm />} />
  
          {/* Order Item routes */}
          <Route path="order-items/create" element={<OrderItemForm />} />
          <Route path="order-items/edit/:id" element={<OrderItemForm />} />
  
          {/* Orders */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetails />} />
  
          {/* Tables */}
          <Route path="tables" element={<TableList />} />
        </Route>
  
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }
  
  export default App;