/**
 * App.jsx - MakeInspires Dashboard v45.3
 * Main application file with authentication, layout, and state management
 * Split from monolithic file for better maintainability
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Lock, Activity, TrendingUp, Calendar, Brain, Users, 
  Globe, Upload, LogOut, ChevronDown, X, RefreshCw, Eye, EyeOff 
} from 'lucide-react';
import { DashboardTabs } from './Tabs';
import { filterTransactions, calculateMetrics } from './Utils';

// MakeInspires Logo Component
const MakeInspiresLogo = ({ size = 32 }) => (
  <img 
    src="https://static.wixstatic.com/media/107b16_5f29910420a944bc8577820a2e89eb63~mv2.jpg" 
    alt="MakeInspires Logo" 
    width={size} 
    height={size}
    className="flex-shrink-0 rounded-full"
    style={{ width: size, height: size, objectFit: 'cover' }}
  />
);

// Main Dashboard Component
const MakeInspiresDashboard = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [location, setLocation] = useState('all');
  const [programType, setProgramType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Data state - starts empty (no sample data)
  const [dashboardData, setDashboardData] = useState({
    transactions: [],
    overview: {
      totalRevenue: 0,
      uniqueCustomers: 0,
      totalTransactions: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      customerRetention: 0
    },
    programData: [],
    locationData: [],
    monthlyRevenue: [],
    uploadHistory: [],
    lastUpdated: new Date().toISOString()
  });
  
  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('makeinspiresUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    // Demo authentication
    const users = [
      { email: 'admin@makeinspires.com', password: 'password123', role: 'admin', name: 'Admin User' },
      { email: 'manager@makeinspires.com', password: 'password123', role: 'manager', name: 'Manager User' },
      { email: 'viewer@makeinspires.com', password: 'password123', role: 'viewer', name: 'Viewer User' }
    ];
    
    const foundUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    setTimeout(() => {
      if (foundUser) {
        const userData = {
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name
        };
        setUser(userData);
        localStorage.setItem('makeinspiresUser', JSON.stringify(userData));
        setEmail('');
        setPassword('');
      } else {
        setAuthError('Invalid email or password. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('makeinspiresUser');
    setActiveTab('overview');
  };
  
  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!dashboardData.transactions || dashboardData.transactions.length === 0) {
      return dashboardData;
    }
    
    const filtered = filterTransactions(dashboardData.transactions, {
      dateRange,
      location: location === 'all' ? null : location,
      programType: programType === 'all' ? null : programType
    });
    
    const metrics = calculateMetrics(filtered);
    
    return {
      ...dashboardData,
      ...metrics
    };
  }, [dashboardData.transactions, dateRange, location, programType]);
  
  // Tab configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'yoy', name: 'YoY', icon: Calendar },
    { id: 'predictive', name: 'Predictive', icon: Brain },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'partners', name: 'Partners', icon: Globe },
    { id: 'upload', name: 'Upload', icon: Upload }
  ];
  
  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <MakeInspiresLogo size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">MakeInspires Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">v45.3 - Revenue Fix</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {authError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1">
              <p><code>admin@makeinspires.com</code> / <code>password123</code></p>
              <p><code>manager@makeinspires.com</code> / <code>password123</code></p>
              <p><code>viewer@makeinspires.com</code> / <code>password123</code></p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MakeInspiresLogo />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MakeInspires Analytics</h1>
                <p className="text-xs text-gray-500">v45.3 - Revenue Fix</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Filter */}
            <select
