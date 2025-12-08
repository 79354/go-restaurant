// pages/users/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, User, Mail, Phone, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { userAPI } from '../../services/api';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    avatar: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      if (isEdit) {
        try {
          setLoading(true);
          const userData = await userAPI.getUser(id);
          setFormData({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'USER',
            avatar: userData.avatar || '',
            password: '',
            confirmPassword: ''
          });
        } catch (error) {
          setApiError(error.message || 'Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isEdit && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const userData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        avatar: formData.avatar
      };

      // Only include password for new users
      if (!isEdit && formData.password) {
        userData.password = formData.password;
      }

      if (isEdit) {
        await userAPI.updateUser(id, userData);
      } else {
        await userAPI.createUser(userData);
      }
      
      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
      
    } catch (error) {
      setApiError(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }));
        // Clear image error if exists
        if (errors.avatar) {
          setErrors(prev => ({ ...prev, avatar: '' }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={() => navigate('/users')}
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
                User {isEdit ? 'updated' : 'created'} successfully! Redirecting...
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="USER">Customer</option>
                  <option value="STAFF">Staff Member</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {!isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Create a password"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Password must be at least 6 characters
                    </p>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="space-y-4">
                  {formData.avatar ? (
                    <div className="relative">
                      <img
                        src={formData.avatar}
                        alt="Profile preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors bg-gray-50">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload profile picture</p>
                      <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                      <label className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 cursor-pointer transition-all transform hover:scale-105">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {errors.avatar && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.avatar}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </div>
              ) : (
                isEdit ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}