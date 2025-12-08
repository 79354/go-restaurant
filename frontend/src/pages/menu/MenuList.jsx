import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, AlertCircle, Filter } from 'lucide-react';
import { menuAPI } from '../../services/api';

export default function MenuList() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const menusData = await menuAPI.getMenus(1, 100);
        setMenus(menusData.data || []);
      } catch (error) {
        setError(error.message || 'Failed to load menus');
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu? This will also remove all food items in this menu.')) {
      try {
        await menuAPI.deleteMenu(id);
        setMenus(prev => prev.filter(menu => menu.id !== id));
      } catch (error) {
        setError('Failed to delete menu. Please try again.');
      }
    }
  };

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = !searchTerm || 
                         menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         menu.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && menu.active) ||
                         (filterStatus === 'inactive' && !menu.active);
    
    const matchesCategory = filterCategory === 'all' || menu.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'beverage': return 'bg-blue-100 text-blue-800';
      case 'dessert': return 'bg-pink-100 text-pink-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'beverage': return '🥤';
      case 'dessert': return '🍰';
      case 'special': return '✨';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menus</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant's menu categories</p>
        </div>
        <button
          onClick={() => navigate('/menus/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Menu
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search menus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="food">Food Menu</option>
            <option value="beverage">Beverage Menu</option>
            <option value="dessert">Dessert Menu</option>
            <option value="special">Special Menu</option>
          </select>
        </div>
      </div>

      {/* Menus Grid */}
      {filteredMenus.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No menus found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => navigate('/menus/create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Create Your First Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getCategoryIcon(menu.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{menu.name}</h3>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-1 ${getCategoryColor(menu.category)}`}>
                        {menu.category.charAt(0).toUpperCase() + menu.category.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/menus/edit/${menu.id}`)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{menu.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    menu.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {menu.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {menu.itemsCount || 0} items
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}