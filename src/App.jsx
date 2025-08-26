/**
 * App.jsx - MakeInspires Dashboard v46.0
 * Main application file with authentication, layout, and state management
 * 
 * CONTINUITY NOTES:
 * - Part of 3-file modular architecture (App.jsx, Tabs.jsx, Utils.jsx)
 * - Imports DashboardTabs from './Tabs' and utility functions from './Utils'
 * - Maintains all dashboard state and passes props to tab components
 * - Handles authentication, filtering, and data persistence
 * 
 * CURRENT FEATURES (v46.0 - ALL WORKING):
 * ✅ Authentication System:
 *    - 3-tier role system (admin, manager, viewer)
 *    - Demo credentials with password123 for all accounts
 *    - Session persistence via localStorage ('user' key)
 *    - Password visibility toggle with Eye/EyeOff icons
 * 
 * ✅ State Management:
 *    - Authentication: user, email, password, authError, isLoading, showPassword
 *    - Navigation: activeTab (7 tabs total)
 *    - Filtering: dateRange, location, programType, showFilters
 *    - Custom dates: customStartDate, customEndDate
 *    - Data: dashboardData with transactions array
 *    - Status: uploadStatus for upload feedback
 * 
 * ✅ Data Filtering System:
 *    - Date ranges: all, 7d, 30d, 90d, 6m, 12m, ytd, custom
 *    - Locations: all, Mamaroneck, NYC, Chappaqua, Partner
 *    - Program types: all, Parties, Semester, Camps, Workshops, Private, Other
 *    - Uses filterTransactions() and calculateMetrics() from Utils.jsx
 * 
 * ✅ Data Persistence:
 *    - Saves dashboardData to localStorage when transactions exist
 *    - Loads saved data on component mount
 *    - Preserves user session across page refreshes
 * 
 * ✅ UI Components:
 *    - MakeInspiresLogo component with size prop
 *    - Responsive header with filters toggle
 *    - Tab navigation with icon indicators
 *    - Advanced filters panel (collapsible)
 *    - Date range display showing data source timeframe
 * 
 * CHANGELOG v46.0:
 * - Updated program category filters to match new categories:
 *   Old: Party, Semester, Weekly, Dropin, Camp, Workshop, Other
 *   New: Parties, Semester, Camps, Workshops, Private, Other
 * - All other features preserved from v45.4
 * - Date range filtering and custom dates still fully functional
 * - Data source date range display maintained
 * 
 * PROPS PASSED TO DASHBOARDTABS:
 * - activeTab, dashboardData, setDashboardData
 * - uploadStatus, setUploadStatus
 * - user (for role-based access)
 * - dateRange, location, programType
 * - customStartDate, customEndDate
 * 
 * DEPENDENCIES:
 * - React hooks: useState, useEffect, useMemo
 * - Lucide React icons for UI elements
 * - DashboardTabs component from './Tabs'
 * - Utility functions from './Utils'
 * - Tailwind CSS for styling
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Lock, Activity, TrendingUp, Calendar, Brain, Users, 
  Globe, Upload, LogOut, ChevronDown, Eye, EyeOff 
} from 'lucide-react';
import { DashboardTabs } from './Tabs';
import { filterTransactions, calculateMetrics } from './Utils';

// MakeInspires Logo Component - displays company logo with configurable size
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

// Main Dashboard Component - orchestrates entire application
const MakeInspiresDashboard = () => {
  // Authentication state - manages user login/session
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Dashboard state - controls UI and data filtering
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [location, setLocation] = useState('all');
  const [programType, setProgramType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Dashboard data - initialized from localStorage or defaults
  const [dashboardData, setDashboardData] = useState(() => {
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
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
    };
  });
  
  // Load user session from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  // Save dashboard data to localStorage whenever it changes
  useEffect(() => {
    if (dashboardData.transactions && dashboardData.transactions.length > 0) {
      localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    }
  }, [dashboardData]);
  
  // Authentication handler - validates credentials and creates session
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    // Simulate async authentication
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
  
  // Logout handler - clears session and resets to initial state
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('overview');
  };
  
  // Apply filters to dashboard data using memoization for performance
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
  
  // Tab configuration - defines navigation structure
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'yoy', name: 'YoY', icon: Calendar },
    { id: 'predictive', name: 'Predictive', icon: Brain },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'partners', name: 'Partners', icon: Globe },
    { id: 'upload', name: 'Upload', icon: Upload }
  ];
  
  // Login screen - displayed when no user session exists
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
          <div className="text-center mb-8">
            <MakeInspiresLogo size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">MakeInspires Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">v46.0</p>
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
  
  // Main dashboard layout - displayed after successful authentication
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - contains logo, title, version, and user menu */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MakeInspiresLogo size={32} />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">MakeInspires Dashboard</h1>
              <span className="ml-3 text-xs text-gray-500">v46.0</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filters toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                <span>Filters</span>
              </button>
              
              {/* User info and logout */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Panel - collapsible, shown when showFilters is true */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              </div>
              
              {/* Custom Date Range - shown only when dateRange is 'custom' */}
              {dateRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  <option value="Mamaroneck">Mamaroneck</option>
                  <option value="NYC">NYC</option>
                  <option value="Chappaqua">Chappaqua</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
              
              {/* Program Type Filter - Updated v46.0 categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Type
                </label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Programs</option>
                  <option value="Parties">Parties</option>
                  <option value="Semester">Semester</option>
                  <option value="Camps">Camps</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Private">Private</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation - horizontal scrollable tabs */}
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
                <tab.icon size={20} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content Area - renders active tab component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
};

export default MakeInspiresDashboard;
