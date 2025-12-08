// pages/tables/TableForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';

const locations = [
  'Window Side',
  'Center',
  'Private Room',
  'Outdoor',
  'Bar Area',
  'VIP Section'
];

export default function TableForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    status: 'AVAILABLE',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      // Simulate loading existing table data
      setLoading(true);
      setTimeout(() => {
        setFormData({
          tableNumber: 1,
          capacity: 4,
          status: 'AVAILABLE',
          location: 'Window Side'
        });
        setLoading(false);
      }, 800);
    } else {
      // Auto-assign next available table number
      setLoading(true);
      setTimeout(() => {
        const nextTableNumber = Math.max(...mockTables.map(t => t.number)) + 1;
        setFormData(prev => ({ ...prev, tableNumber: nextTableNumber }));
        setLoading(false);
      }, 500);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tableNumber) {
      newErrors.tableNumber = 'Table number is required';
    }
    
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Table data saved:', formData);
    setLoading(false);
    navigate('/tables');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Table' : 'Create Table'}
            </h2>
            <button
              onClick={() => navigate('/tables')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">Saving table...</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number *
              </label>
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tableNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter table number"
              />
              {errors.tableNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.tableNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {[1,2,3,4,5,6,7,8,10,12].map(capacity => (
                  <option key={capacity} value={capacity}>{capacity} guests</option>
                ))}
              </select>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/tables')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Table' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}