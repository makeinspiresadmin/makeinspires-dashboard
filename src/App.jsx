/**
 * App.jsx - MakeInspires Dashboard v46.0
 * Main application file with authentication, layout, and state management
 * 
 * CHANGELOG v46.1:
 * - Updated program category filters
 * - Added date range filtering  
 * - Added data source date range display
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Lock, Activity, TrendingUp, Calendar, Brain, Users, 
  Globe, Upload, LogOut, ChevronDown, Eye, EyeOff 
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
  const [uploadStatus, setUploadStatus] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
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
    transactions: [],
    uploadHistory: [],
    lastUpdated: null
  });
  
// Calculate data source date range for display - UPDATED in v46.1
const dataSourceDateRange = useMemo(() => {
  if (!dashboardData.transactions || dashboardData.transactions.length === 0) {
    return '';
  }
  
  const dates = dashboardData.transactions.map(t => new Date(t.orderDate));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // Updated format to include day - NEW in v46.1
  const formatDateWithDay = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  
  return ` (${formatDateWithDay(minDate)} - ${formatDateWithDay(maxDate)})`;
}, [dashboardData.transactions]);
  
  // Load user and data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
      try {
        setDashboardData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);
  
  // Save dashboard data to localStorage when it changes
  useEffect(() => {
    if (dashboardData.transactions && dashboardData.transactions.length > 0) {
      localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    }
  }, [dashboardData]);
  
  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    setTimeout(() => {
      const users = {
        'admin@makeinspires.com': { role: 'admin', name: 'Admin User' },
        'manager@makeinspires.com': { role: 'manager', name: 'Manager User' },
        'viewer@makeinspires.com': { role: 'viewer', name: 'Viewer User' }
      };
      
      const normalizedEmail = email.toLowerCase().trim();
      
      if (users[normalizedEmail] && password === 'password123') {
        const userData = { email: normalizedEmail, ...users[normalizedEmail] };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setEmail('');
        setPassword('');
      } else {
        setAuthError('Invalid email or password');
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('overview');
  };
  
  // Apply filters to dashboard data
  const filteredDashboardData = useMemo(() => {
    const filters = {
      dateRange,
      startDate: dateRange === 'custom' ? customStartDate : null,
      endDate: dateRange === 'custom' ? customEndDate : null,
      location: location === 'all' ? null : location,
      programType: programType === 'all' ? null : programType
    };
    
    const filtered = filterTransactions(dashboardData.transactions, filters);
    const metrics = calculateMetrics(filtered);
    
    return {
      ...dashboardData,
      ...metrics
    };
  }, [dashboardData.transactions, dateRange, location, programType, customStartDate, customEndDate]);
  
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
            <p className="text-sm text-gray-600 mt-1">v46.1</p>
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
                  type={showPassword ? 'text' : 'password'}
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
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                {authError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Demo credentials:</p>
              <p className="mt-1">admin@makeinspires.com / password123</p>
              <p>manager@makeinspires.com / password123</p>
              <p>viewer@makeinspires.com / password123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MakeInspiresLogo size={32} />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">MakeInspires Dashboard</h1>
              <span className="ml-3 text-xs text-gray-500">v46.1{dataSourceDateRange}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-4">
            {/* Date Range Dropdown */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* Location Dropdown */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Locations</option>
              <option value="Mamaroneck">Mamaroneck</option>
              <option value="NYC">NYC</option>
              <option value="Chappaqua">Chappaqua</option>
              <option value="Partner">Partners</option>
              <option value="Other">Other</option>
            </select>
            
            {/* Program Type Dropdown */}
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Programs</option>
              <option value="Parties">Parties</option>
              <option value="Semester">Semester</option>
              <option value="Camps">Camps</option>
              <option value="Workshops">Workshops</option>
              <option value="Private">Private</option>
              <option value="Other">Other</option>
            </select>
            
            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <span>Advanced Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Custom Date Range Inputs (show inline when custom is selected) */}
            {dateRange === 'custom' && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Additional filter options can go here */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customer Type</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                  <option value="all">All Customers</option>
                  <option value="new">New Customers</option>
                  <option value="returning">Returning Customers</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Revenue Range</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                  <option value="all">All Ranges</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500+">$500+</option>
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => {
                    setDateRange('all');
                    setLocation('all');
                    setProgramType('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardTabs
          activeTab={activeTab}
          dashboardData={filteredDashboardData}
          setDashboardData={setDashboardData}
          uploadStatus={uploadStatus}
          setUploadStatus={setUploadStatus}
          user={user}
          dateRange={dateRange}
          location={location}
          programType={programType}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>
    </div>
  );
}

export default MakeInspiresDashboard;
