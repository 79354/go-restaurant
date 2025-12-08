import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Minus, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { orderItemAPI, foodAPI } from '../../services/api';

export default function OrderItemForm() {
  const { id, itemId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!itemId;

  const [formData, setFormData] = useState({
    foodId: '',
    quantity: 1,
    price: 0,
    notes: ''
  });

  const [foods, setFoods] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load foods
        const foodsData = await foodAPI.getFoods({ page: 1, recordPerPage: 100 });
        setFoods(foodsData.data || []);
        
        // Load existing item if editing
        if (isEdit) {
          const itemData = await orderItemAPI.getOrderItem(id, itemId);
          setFormData({
            foodId: itemData.foodId || '',
            quantity: itemData.quantity || 1,
            price: itemData.price || 0,
            notes: itemData.notes || ''
          });
        }
      } catch (error) {
        setApiError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, itemId, isEdit]);

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

  const handleQuantityChange = (change) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.foodId) {
      newErrors.foodId = 'Food selection is required';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
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
      const itemData = {
        foodId: formData.foodId,
        quantity: formData.quantity,
        price: formData.price,
        notes: formData.notes
      };

      if (isEdit) {
        await orderItemAPI.updateOrderItem(id, itemId, itemData);
      } else {
        await orderItemAPI.createOrderItem(id, itemData);
      }
      
      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate(`/orders/${id}`);
      }, 1500);
      
    } catch (error) {
      setApiError(error.message || 'Failed to save order item');
    } finally {
      setLoading(false);
    }
  };

  const selectedFood = foods.find(food => food.id === formData.foodId);

  useEffect(() => {
    if (selectedFood && selectedFood.price) {
      setFormData(prev => ({ ...prev, price: selectedFood.price }));
    }
  }, [formData.foodId, selectedFood]);

  if (loading && isEdit) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="animate-pulse p-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? 'Edit Order Item' : 'Add Order Item'}
            </h2>
            <button
              onClick={() => navigate(`/orders/${id}`)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800 text-sm">
                Order item {isEdit ? 'updated' : 'added'} successfully! Redirecting...
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Item *
              </label>
              <select
                name="foodId"
                value={formData.foodId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.foodId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="">Select food item</option>
                {foods.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} - ${food.price?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
              {errors.foodId && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.foodId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.quantity && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="pl-8 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  placeholder="0.00"
                  disabled={selectedFood && selectedFood.price}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Total: ${(formData.price * formData.quantity).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                placeholder="Any special requests or modifications..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/orders/${id}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </div>
              ) : (
                isEdit ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}