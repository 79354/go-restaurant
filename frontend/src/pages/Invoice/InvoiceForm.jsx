import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Minus, Download, Printer, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { invoiceAPI, orderAPI, userAPI } from '../../services/api';

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    orderId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '',
    items: [],
    notes: 'Thank you for your business!'
  });

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load orders and customers
        const [ordersData, customersData] = await Promise.all([
          orderAPI.getOrders(1, 100),
          userAPI.getUsers(1, 100)
        ]);
        
        setOrders(ordersData.data || []);
        setCustomers(customersData.data?.filter(u => u.role === 'customer') || []);
        
        // Load existing invoice if editing
        if (isEdit) {
          const invoiceData = await invoiceAPI.getInvoice(id);
          setFormData({
            orderId: invoiceData.orderId || '',
            invoiceNumber: invoiceData.invoiceNumber || '',
            date: invoiceData.date || new Date().toISOString().split('T')[0],
            dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customerId: invoiceData.customerId || '',
            items: invoiceData.items || [],
            notes: invoiceData.notes || 'Thank you for your business!'
          });
          
          // Set selected order if orderId exists
          if (invoiceData.orderId) {
            const order = ordersData.data?.find(o => o.id === invoiceData.orderId);
            setSelectedOrder(order);
          }
        } else {
          // Generate invoice number
          const nextInvoiceNumber = `INV-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
          setFormData(prev => ({ ...prev, invoiceNumber: nextInvoiceNumber }));
        }
      } catch (error) {
        setApiError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.orderId) {
      const order = orders.find(o => o.id === formData.orderId);
      setSelectedOrder(order);
      if (order) {
        setFormData(prev => ({
          ...prev,
          customerId: order.customerId || prev.customerId,
          items: order.items?.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          })) || []
        }));
      }
    }
  }, [formData.orderId, orders]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now().toString(), 
        name: '', 
        price: 0, 
        quantity: 1,
        total: 0 
      }]
    }));
  };

  const removeItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              [field]: value,
              total: field === 'quantity' || field === 'price' 
                ? (field === 'quantity' ? value * item.price : item.quantity * value)
                : item.total
            } 
          : item
      )
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }
    
    if (!formData.orderId) {
      newErrors.orderId = 'Order selection is required';
    }
    
    if (!formData.customerId) {
      newErrors.customerId = 'Customer selection is required';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      const invoiceData = {
        ...formData,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal()
      };

      if (isEdit) {
        await invoiceAPI.updateInvoice(id, invoiceData);
      } else {
        await invoiceAPI.createInvoice(invoiceData);
      }
      
      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
      
    } catch (error) {
      setApiError(error.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // In a real app, this would generate a PDF
    alert('Invoice exported as PDF!');
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  if (loading && isEdit) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800 text-sm">
                Invoice {isEdit ? 'updated' : 'created'} successfully! Redirecting...
              </p>
            </div>
          )}

          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Invoice Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order *
                </label>
                <select
                  value={formData.orderId}
                  onChange={handleChange}
                  name="orderId"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.orderId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.id} - {order.customerName} (${order.total})
                    </option>
                  ))}
                </select>
                {errors.orderId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.orderId}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.invoiceNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="INV-001"
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.invoiceNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.customerId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              
              {selectedOrder ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="font-medium text-right">{selectedOrder.customerAddress}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">Select an order to view customer information</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No items added yet. Click "Add Item" to begin.
                      </td>
                    </tr>
                  ) : (
                    formData.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter item name"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-32">
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-12 text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                              className="px-2 py-1 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="pl-6 w-24 px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span className="font-medium">${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-semibold text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all"
              placeholder="Enter any additional notes for the customer..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </div>
              ) : (
                isEdit ? 'Update Invoice' : 'Create Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}