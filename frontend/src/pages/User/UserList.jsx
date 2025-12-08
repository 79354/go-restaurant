// pages/users/UserList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, User, AlertCircle, Filter } from 'lucide-react';
import { userAPI } from '../../services/api';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await userAPI.getUsers(1, 100);
        setUsers(usersData.data || []);
      } catch (error) {
        setError(error.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userAPI.deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch (error) {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return '👑';
      case 'STAFF':
        return '👨‍💼';
      case 'USER':
        return '👤';
      default:
        return '👤';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // For now, all users are active (no status field in model)
    const matchesStatus = filterStatus === 'all' || filterStatus === 'active';
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage restaurant staff and customers</p>
        </div>
        <button
          onClick={() => navigate('/users/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add User
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
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="STAFF">Staff</option>
            <option value="USER">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => navigate('/users/create')}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all"
          >
            Add Your First User
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.first_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{getRoleIcon(user.role)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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