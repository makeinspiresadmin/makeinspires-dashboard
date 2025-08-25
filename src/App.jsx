/**
 * App.jsx - MakeInspires Dashboard v45.4
 * Main application file with authentication, layout, and state management
 * Split from monolithic file for better maintainability
 * 
 * CHANGELOG v45.4:
 * - Added custom date range filtering with start/end date selection
 * - Added data source date range display next to version number
 * - Enhanced date filtering logic in filterTransactions
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
  
  // Custom date range state (NEW in v45.4)
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
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
  
  // Calculate data source date range (NEW in v45.4)
  const dataSourceDateRange = useMemo(() => {
    if (!dashboardData.transactions || dashboardData.transactions.length === 0) {
      return null;
    }
    
    const dates = dashboardData.transactions.map(t => new Date(t.orderDate));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${month}/${day}/${year}`;
    };
    
    return `${formatDate(minDate)}-${formatDate(maxDate)}`;
  }, [dashboardData.transactions]);
  
  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('makeinspiresUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user session:', e);
      }
    }
    
    // Load saved data
    const savedData = localStorage.getItem('makeinspiresData');
    if (savedData) {
      try {
        setDashboardData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      }
    }
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    if (dashboardData.transactions.length > 0) {
      localStorage.setItem('makeinspiresData', JSON.stringify(dashboardData));
    }
  }, [dashboardData]);
  
  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');
    
    // Demo accounts
    const validUsers = {
      'admin@makeinspires.com': { password: 'password123', role: 'admin', name: 'Admin User' },
      'manager@makeinspires.com': { password: 'password123', role: 'manager', name: 'Manager User' },
      'viewer@makeinspires.com': { password: 'password123', role: 'viewer', name: 'Viewer User' }
    };
    
    const normalizedEmail = email.toLowerCase().trim();
    const userAccount = validUsers[normalizedEmail];
    
    setTimeout(() => {
      if (userAccount && password === userAccount.password) {
        const userData = {
          email: normalizedEmail,
          role: userAccount.role,
          name: userAccount.name
        };
        setUser(userData);
        localStorage.setItem('makeinspiresUser', JSON.stringify(userData));
        setEmail('');
        setPassword('');
      } else {
        setAuthError('Invalid email or password');
      }
      setIsLoading(false);
    }, 500);
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('makeinspiresUser');
  };
  
  // Enhanced filtering with custom date range (UPDATED in v45.4)
  const filteredData = useMemo(() => {
    const filters = {
      dateRange,
      customStartDate: dateRange === 'custom' ? customStartDate : null,
      customEndDate: dateRange === 'custom' ? customEndDate : null,
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
            <p className="text-sm text-gray-600 mt-1">v45.4 - Date Range Features</p>
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
              <div className="text-red-600 text-sm text-center">{authError}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-400 space-y-1 text-center">
              <div>admin@makeinspires.com / password123</div>
              <div>manager@makeinspires.com / password123</div>
              <div>viewer@makeinspires.com / password123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <MakeInspiresLogo size={40} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MakeInspires Analytics</h1>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>v45.4</span>
                  {dataSourceDateRange && (
                    <>
                      <span>•</span>
                      <span>Data Sources: {dataSourceDateRange}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {user.role}
              </span>
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
      <nav className="bg-white shadow-sm border-b">
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
      </nav>
      
      {/* Filter Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            
            {/* Custom Date Range Inputs (NEW in v45.4) */}
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              <span>Advanced Filters</span>
            </button>
            
            {(dateRange !== 'all' || location !== 'all' || programType !== 'all') && (
              <button
                onClick={() => {
                  setDateRange('all');
                  setLocation('all');
                  setProgramType('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <X size={14} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  <option value="Mamaroneck">Mamaroneck</option>
                  <option value="NYC">NYC</option>
                  <option value="Chappaqua">Chappaqua</option>
                  <option value="Partner">Partner Locations</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Program Type
                </label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Programs</option>
                  <option value="Semester Programs">Semester Programs</option>
                  <option value="Weekly Classes">Weekly Classes</option>
                  <option value="Drop-in Sessions">Drop-in Sessions</option>
                  <option value="Birthday Parties">Birthday Parties</option>
                  <option value="Camps & Intensives">Camps & Intensives</option>
                  <option value="Workshops & MakeJams">Workshops & MakeJams</option>
                  <option value="Other Programs">Other Programs</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {filteredData.overview.totalTransactions.toLocaleString()} transactions
                  {dateRange !== 'all' && ' (filtered)'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardTabs
          activeTab={activeTab}
          dashboardData={filteredData}
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
      </main>
    </div>
  );
};

export default MakeInspiresDashboard;
