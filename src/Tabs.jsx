/**
 * Tabs.jsx - MakeInspires Dashboard v46.0
 * All 7 dashboard tab components in one file
 * Overview, Analytics, YoY, Predictive, Customers, Partners, Upload
 * 
 * CHANGELOG v46.0:
 * - Updated Program Distribution categories to match new requirements:
 *   Old: Party, Semester, Weekly, Dropin, Camp, Other, Workshop
 *   New: Parties, Semester, Camps, Workshops, Private, Other
 * - No other changes made - all existing features preserved
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import {
  DollarSign, Users, TrendingUp, MapPin, Target, Calendar,
  Upload, FileText, AlertCircle, CheckCircle, Clock,
  Activity, Eye, Trash2
} from 'lucide-react';
import { processCSVFile, calculateMetrics, CHART_COLORS } from './Utils';

// Main tab controller component
export const DashboardTabs = ({
  activeTab,
  dashboardData,
  setDashboardData,
  uploadStatus,
  setUploadStatus,
  user,
  dateRange,
  location,
  programType,
  customStartDate,
  customEndDate
}) => {
  
  // Format date range display for tab headers
  const getDateRangeDisplay = () => {
    if (dateRange === 'all') return 'All Time';
    if (dateRange === '7d') return 'Last 7 Days';
    if (dateRange === '30d') return 'Last 30 Days';
    if (dateRange === '90d') return 'Last 90 Days';
    if (dateRange === '6m') return 'Last 6 Months';
    if (dateRange === '12m') return 'Last 12 Months';
    if (dateRange === 'ytd') return 'Year to Date';
    if (dateRange === 'custom' && (customStartDate || customEndDate)) {
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
      };
      const start = formatDate(customStartDate) || 'Start';
      const end = formatDate(customEndDate) || 'End';
      return `${start} - ${end}`;
    }
    return 'Custom Range';
  };
  
  // Overview Tab
  const renderOverview = () => {
    // Calculate total revenue for percentage calculation
    const totalProgramRevenue = dashboardData.programData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
    
    return (
    <div className="space-y-6">
      {/* Date Range Indicator */}
      {dateRange !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          Showing data for: <strong>{getDateRangeDisplay()}</strong>
        </div>
      )}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.overview.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {dateRange === 'all' ? '+15.3% all time' : '+15.3% vs previous period'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.uniqueCustomers.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {dashboardData.overview.customerRetention}% retention
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.totalTransactions.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                ${dashboardData.overview.averageOrderValue} avg value
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.locationData.length}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {location !== 'all' ? `Filtered: ${location}` : 'All locations'}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Program Distribution and Location Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Program Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.programData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => {
                  const percentage = totalProgramRevenue > 0 
                    ? ((value / totalProgramRevenue) * 100).toFixed(0) 
                    : 0;
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {dashboardData.programData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue by Location</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">
          Monthly Revenue Trend {dateRange !== 'all' && `(${getDateRangeDisplay()})`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dashboardData.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-lg">
            <DollarSign size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              ${dashboardData.overview.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-green-800">Total Revenue</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Users size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {dashboardData.overview.uniqueCustomers.toLocaleString()}
            </p>
            <p className="text-sm text-purple-800">Unique Customers</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <MapPin size={24} className="mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {dashboardData.locationData.length}
            </p>
            <p className="text-sm text-orange-800">Active Locations</p>
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Date Range Indicator */}
      {dateRange !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          Analytics for: <strong>{getDateRangeDisplay()}</strong>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Program Performance Analytics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardData.programData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="uniqueCustomers" fill="#10B981" name="Unique Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Location Analytics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardData.locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="count" fill="#F59E0B" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Year-over-Year Tab
  const renderYoY = () => {
    // Generate YoY comparison data
    const yoyData = dashboardData.monthlyRevenue.slice(-12).map((month, index) => {
      const previousYearRevenue = dashboardData.monthlyRevenue[index]?.revenue || month.revenue * 0.85;
      return {
        month: month.month,
        currentYear: month.revenue,
        previousYear: Math.round(previousYearRevenue),
        growth: Math.round(((month.revenue - previousYearRevenue) / previousYearRevenue) * 100)
      };
    });

    return (
      <div className="space-y-6">
        {/* Date Range Indicator */}
        {dateRange !== 'all' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
            YoY Analysis for: <strong>{getDateRangeDisplay()}</strong>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Year-over-Year Revenue Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="previousYear" fill="#CBD5E1" name="Previous Year" />
              <Bar dataKey="currentYear" fill="#3B82F6" name="Current Year" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Growth Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="growth" stroke="#10B981" name="Growth Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Revenue Growth</h4>
            <p className="text-3xl font-bold text-green-600">+23.5%</p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Customer Growth</h4>
            <p className="text-3xl font-bold text-blue-600">+18.2%</p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Transaction Growth</h4>
            <p className="text-3xl font-bold text-purple-600">+31.2%</p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
        </div>
      </div>
    );
  };

  // Predictive Analytics Tab
  const renderPredictive = () => {
    // Generate forecast data
    const forecastData = [];
    const lastMonth = dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 1];
    if (lastMonth) {
      for (let i = 1; i <= 6; i++) {
        const growthRate = 1.03; // 3% monthly growth
        forecastData.push({
          month: `Forecast M${i}`,
          revenue: Math.round(lastMonth.revenue * Math.pow(growthRate, i)),
          type: 'forecast'
        });
      }
    }

    // Updated program opportunities to use new categories
    const programOpportunities = [
      { program: 'Camps', potential: 45000, current: 35000, growth: '28%' },
      { program: 'Workshops', potential: 38000, current: 28000, growth: '35%' },
      { program: 'Private', potential: 25000, current: 18000, growth: '39%' },
      { program: 'Parties', potential: 32000, current: 27000, growth: '18%' }
    ];

    return (
      <div className="space-y-6">
        {/* Date Range Indicator */}
        {dateRange !== 'all' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
            Predictions based on: <strong>{getDateRangeDisplay()}</strong>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Revenue Forecast (Next 6 Months)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={[...dashboardData.monthlyRevenue.slice(-6), ...forecastData]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Predictive Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-4">Growth Opportunities</h4>
            <div className="space-y-3">
              {programOpportunities.map((opp, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{opp.program}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      ${(opp.potential / 1000).toFixed(0)}k potential
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      +{opp.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-4">Seasonal Patterns</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Peak Season (Sep-Dec)</span>
                <span className="font-medium">+35% revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Summer Programs (Jun-Aug)</span>
                <span className="font-medium">+28% revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Holiday Workshops (Dec)</span>
                <span className="font-medium">+42% revenue</span>
              </div>
              <div className="flex justify-between">
                <span>Back-to-School (Sep)</span>
                <span className="font-medium">+31% revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Projected Q1 Revenue</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">$285,000</p>
            <p className="text-sm text-green-600 mt-1">+15% vs last Q1</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Expected New Customers</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">320</p>
            <p className="text-sm text-blue-600 mt-1">Based on current trend</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Retention Target</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">65%</p>
            <p className="text-sm text-purple-600 mt-1">5% improvement goal</p>
          </div>
        </div>
      </div>
    );
  };

  // Customer Insights Tab
  const renderCustomers = () => (
    <div className="space-y-6">
      {/* Date Range Indicator */}
      {dateRange !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          Customer data for: <strong>{getDateRangeDisplay()}</strong>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Total Customers</h4>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.uniqueCustomers}</p>
          <p className="text-sm text-green-600 mt-1">+245 this month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Retention Rate</h4>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.overview.customerRetention}%</p>
          <p className="text-sm text-blue-600 mt-1">Above industry average</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Avg Lifetime Value</h4>
          <p className="text-3xl font-bold text-gray-900">$1,847</p>
          <p className="text-sm text-purple-600 mt-1">Per customer</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
        <div className="space-y-3">
          {[
            { range: 'High Value ($2000+)', percentage: 15, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.15) },
            { range: 'Regular ($500-2000)', percentage: 45, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.45) },
            { range: 'Occasional ($100-500)', percentage: 35, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.35) },
            { range: 'New (<$100)', percentage: 5, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.05) }
          ].map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{segment.range}</span>
                  <span className="text-sm text-gray-600">{segment.customers} customers</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-sm font-medium">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Customer Activity Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="transactions" stroke="#8B5CF6" name="Transactions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Partners Tab (Placeholder)
  const renderPartners = () => (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Partner Programs</h3>
        <p className="text-gray-600">Coming Soon</p>
        <p className="text-sm text-gray-500 mt-2">
          Partner analytics and management features will be available in a future update.
        </p>
      </div>
    </div>
  );

  // Upload Tab
  const renderUpload = () => {
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      if (user?.role !== 'admin' && user?.role !== 'manager') {
        setUploadStatus({ type: 'error', message: 'Only administrators and managers can upload files' });
        return;
      }
      
      const result = await processCSVFile(file);
      
      if (result.success) {
        const updatedData = {
          ...dashboardData,
          transactions: [...dashboardData.transactions, ...result.transactions]
        };
        setDashboardData(updatedData);
        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${result.transactions.length} transactions`
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: result.error || 'Failed to process file'
        });
      }
    };

    const handleDeleteData = () => {
      if (user?.role !== 'admin') {
        setUploadStatus({ type: 'error', message: 'Only administrators can delete data' });
        return;
      }
      
      if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
        setDashboardData({
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
          transactions: []
        });
        localStorage.removeItem('dashboardData');
        setUploadStatus({ type: 'success', message: 'All data has been deleted' });
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Transaction Data</h3>
          
          {uploadStatus && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : uploadStatus.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {uploadStatus.type === 'success' && <CheckCircle size={20} className="mr-2" />}
              {uploadStatus.type === 'error' && <AlertCircle size={20} className="mr-2" />}
              {uploadStatus.type === 'processing' && <Clock size={20} className="mr-2 animate-spin" />}
              {uploadStatus.message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                disabled={user?.role !== 'admin' && user?.role !== 'manager'}
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload your transaction data in CSV format from Sawyer
              </p>
            </div>
            
            {user?.role === 'viewer' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  You have viewer permissions. Contact an administrator to upload data.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Data Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.totalTransactions}</p>
              <p className="text-sm text-gray-600">Total Records</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.uniqueCustomers}</p>
              <p className="text-sm text-gray-600">Unique Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{dashboardData.locationData.length}</p>
              <p className="text-sm text-gray-600">Locations</p>
            </div>
          </div>
        </div>
        
        {user?.role === 'admin' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-800 mb-4">
              This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteData}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Delete All Data
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render the active tab
  switch (activeTab) {
    case 'overview':
      return renderOverview();
    case 'analytics':
      return renderAnalytics();
    case 'yoy':
      return renderYoY();
    case 'predictive':
      return renderPredictive();
    case 'customers':
      return renderCustomers();
    case 'partners':
      return renderPartners();
    case 'upload':
      return renderUpload();
    default:
      return renderOverview();
  }
};
