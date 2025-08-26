/**
 * Tabs.jsx - MakeInspires Dashboard v46.0
 * All 7 dashboard tab components in one file
 * Overview, Analytics, YoY, Predictive, Customers, Partners, Upload
 * 
 * CONTINUITY NOTES:
 * - Part of 3-file modular architecture (App.jsx, Tabs.jsx, Utils.jsx)
 * - Imported by App.jsx as DashboardTabs component
 * - Imports from Utils.jsx: processCSVFile, calculateMetrics, CHART_COLORS
 * - Renders the active tab based on activeTab prop from App.jsx
 * 
 * CURRENT FEATURES (v46.0 - ALL WORKING):
 * ✅ Tab Components (7 total):
 *    1. Overview - KPI cards, program distribution pie chart, location revenue bar chart
 *    2. Analytics - Program performance and location analytics bar charts
 *    3. YoY - Year-over-year growth comparison with line chart
 *    4. Predictive - Revenue forecasting with trend analysis
 *    5. Customers - Customer segments and retention metrics
 *    6. Partners - Placeholder for future partner features
 *    7. Upload - CSV file upload with role-based access control
 * 
 * ✅ Data Visualizations:
 *    - Uses Recharts library for all charts
 *    - PieChart for program distribution
 *    - BarChart for location revenue and analytics
 *    - LineChart for YoY comparisons
 *    - AreaChart for monthly trends
 *    - Responsive containers for all charts
 * 
 * ✅ Role-Based Features:
 *    - Upload tab restricted to admin and manager roles
 *    - Delete data function limited to admin role only
 *    - Viewer role can see all tabs except perform uploads
 * 
 * CHANGELOG v46.0:
 * - Updated Program Distribution categories to match new requirements:
 *   Old: Party, Semester, Weekly, Dropin, Camp, Other, Workshop
 *   New: Parties, Semester, Camps, Workshops, Private, Other
 * - No other changes made - all existing features preserved
 * 
 * PROPS RECEIVED FROM APP.JSX:
 * - activeTab: Current tab to display
 * - dashboardData: Filtered metrics and transactions
 * - setDashboardData: Function to update dashboard data
 * - uploadStatus: Status message for file upload
 * - setUploadStatus: Function to update upload status
 * - user: Current user object with role
 * - dateRange, location, programType: Active filters
 * - customStartDate, customEndDate: Custom date range values
 * 
 * DATA FLOW:
 * 1. Receives filtered data from App.jsx
 * 2. Renders appropriate tab based on activeTab
 * 3. Displays charts using dashboardData metrics
 * 4. Handles file upload and data deletion (admin only)
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

// Main tab controller component - receives props from App.jsx
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
  
  // Format date range display for tab headers - shows current filter state
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
  
  // Overview Tab - Main dashboard view with KPIs and charts
  const renderOverview = () => {
    // Calculate total revenue for percentage calculation in pie chart
    const totalProgramRevenue = dashboardData.programData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
    
    return (
    <div className="space-y-6">
      {/* Date Range Indicator */}
      {dateRange !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
          Showing data for: <strong>{getDateRangeDisplay()}</strong>
        </div>
      )}
      
      {/* KPI Cards - Key metrics at a glance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.overview.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {dateRange === 'all' ? 'All time total' : `${getDateRangeDisplay()}`}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
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
                ${dashboardData.overview.averageOrderValue} avg
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
                {location === 'all' ? 'All locations' : `Filtered: ${location}`}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Program Distribution and Location Revenue Charts */}
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
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
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
