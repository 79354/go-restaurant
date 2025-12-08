// pages/Food/FoodList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Image, Filter, Grid, List } from 'lucide-react';
import { foodAPI, menuAPI } from '../../services/api';

export default function FoodList() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMenu, setFilterMenu] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [foodsData, menusData] = await Promise.all([
          foodAPI.getFoods({ page: 1, recordPerPage: 100 }),
          menuAPI.getMenus()
        ]);
        
        setFoods(foodsData.data || []);
        setMenus(menusData.data || []);
      } catch (error) {
        setError(error.message || 'Failed to load food items');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food item? This action cannot be undone.')) {
      try {
        await foodAPI.deleteFood(id);
        setFoods(prev => prev.filter(food => food.id !== id));
      } catch (error) {
        setError('Failed to delete food item. Please try again.');
      }
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = !searchTerm || 
                         food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && food.available) ||
                         (filterStatus === 'unavailable' && !food.available);
    
    const matchesMenu = filterMenu === 'all' || food.menuId === filterMenu;
    
    return matchesSearch && matchesStatus && matchesMenu;
  });

  const getMenuName = (menuId) => {
    const menu = menus.find(m => m.id === menuId);
    return menu ? menu.name : 'Unknown Menu';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Food Menu</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant's food items</p>
        </div>
        <button
          onClick={() => navigate('/foods/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Food Item
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {/* Menu Filter */}
          <select
            value={filterMenu}
            onChange={(e) => setFilterMenu(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Menus</option>
            {menus.map(menu => (
              <option key={menu.id} value={menu.id}>{menu.name}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Food Items */}
      {filteredFoods.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No food items found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => navigate('/foods/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Add Your First Food Item
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <div key={food.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                {food.image ? (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    food.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{food.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/foods/edit/${food.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{food.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${food.price}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getMenuName(food.menuId)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {food.image ? (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{food.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{food.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{food.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{getMenuName(food.menuId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">${food.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        food.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {food.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/foods/edit/${food.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}