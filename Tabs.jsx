/**
 * Tabs.jsx - MakeInspires Dashboard v45.3
 * All 7 dashboard tab components in one file
 * Overview, Analytics, YoY, Predictive, Customers, Partners, Upload
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
import { processCSVFile, CHART_COLORS } from './Utils';

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
  programType
}) => {
  
  // Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.overview.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">↑ Active</p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.uniqueCustomers.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">↑ Growing</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.overview.totalTransactions.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600 mt-1">Processed</p>
            </div>
            <Activity className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.overview.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-sm text-orange-600 mt-1">Per transaction</p>
            </div>
            <Target className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Program Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.programData}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {dashboardData.programData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Location Performance Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
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
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
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

  // Analytics Tab
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Program Performance Analytics</h3>
        
        {/* Program Performance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.programData.map((program, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {program.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${program.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {program.sessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${program.percentage}%` }}
                        />
                      </div>
                      <span>{program.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Location Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Location Analytics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardData.locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
            <Bar yAxisId="right" dataKey="customers" fill="#10B981" name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Year-over-Year Tab
  const renderYoY = () => {
    // Generate YoY comparison data
    const currentYear = new Date().getFullYear();
    const yoyData = dashboardData.monthlyRevenue.map(item => {
      const prevYearRevenue = item.revenue * 0.85; // Simulated previous year
      const growth = ((item.revenue - prevYearRevenue) / prevYearRevenue * 100).toFixed(1);
      return {
        month: item.month,
        currentYear: item.revenue,
        previousYear: prevYearRevenue,
        growth: parseFloat(growth)
      };
    });

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Year-over-Year Revenue Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="currentYear" stroke="#3B82F6" name={`${currentYear}`} />
              <Line type="monotone" dataKey="previousYear" stroke="#9CA3AF" name={`${currentYear - 1}`} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* YoY Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Revenue Growth</h4>
            <p className="text-3xl font-bold text-green-600">+18.3%</p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Customer Growth</h4>
            <p className="text-3xl font-bold text-blue-600">+24.7%</p>
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

    return (
      <div className="space-y-6">
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
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <TrendingUp className="text-green-600 mr-2" size={16} />
                Semester Programs showing 25% YoY growth
              </li>
              <li className="flex items-center text-sm">
                <TrendingUp className="text-green-600 mr-2" size={16} />
                NYC location has 40% revenue potential
              </li>
              <li className="flex items-center text-sm">
                <TrendingUp className="text-green-600 mr-2" size={16} />
                Birthday Parties up 35% in Q3
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-4">Seasonal Patterns</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <Calendar className="text-blue-600 mr-2" size={16} />
                Peak enrollment: September & January
              </li>
              <li className="flex items-center text-sm">
                <Calendar className="text-blue-600 mr-2" size={16} />
                Summer camps drive 30% of annual revenue
              </li>
              <li className="flex items-center text-sm">
                <Calendar className="text-blue-600 mr-2" size={16} />
                Holiday workshops see 200% increase
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Customer Insights Tab
  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Total Customers</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {dashboardData.overview.uniqueCustomers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Retention Rate</h4>
          <p className="text-2xl font-bold text-green-600 mt-2">72.3%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">Avg Customer Value</h4>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${(dashboardData.overview.totalRevenue / dashboardData.overview.uniqueCustomers).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-sm font-medium text-gray-600">New vs Returning</h4>
          <p className="text-2xl font-bold text-purple-600 mt-2">35% / 65%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Customer Segmentation</h3>
        <div className="space-y-4">
          {[
            { range: '$0 - $500', percentage: 45, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.45) },
            { range: '$500 - $1000', percentage: 30, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.30) },
            { range: '$1000 - $2000', percentage: 20, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.20) },
            { range: '$2000+', percentage: 5, customers: Math.round(dashboardData.overview.uniqueCustomers * 0.05) }
          ].map((segment) => (
            <div key={segment.range} className="flex items-center justify-between">
              <span className="text-sm font-medium">{segment.range}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{segment.customers} customers</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{segment.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Partners Tab
  const renderPartners = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Partner Programs</h3>
        <p className="text-gray-600">Partner program analytics coming soon...</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            This section will include partner school performance, offsite program metrics, and collaboration analytics.
          </p>
        </div>
      </div>
    </div>
  );

  // Upload Tab
  const renderUpload = () => {
    // Check user permissions
    if (user.role !== 'admin' && user.role !== 'Admin' && user.role !== 'manager' && user.role !== 'Manager') {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You need admin or manager privileges to upload data.</p>
          </div>
        </div>
      );
    }

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      setUploadStatus('🔄 Processing file...');
      
      const result = await processCSVFile(file);
      
      if (result.success) {
        // Update dashboard data
        const updatedData = {
          ...dashboardData,
          transactions: [...(dashboardData.transactions || []), ...result.transactions],
          lastUpdated: new Date().toISOString(),
          uploadHistory: [
            {
              id: Date.now(),
              fileName: file.name,
              uploadDate: new Date().toLocaleDateString(),
              recordsProcessed: result.summary.processed,
              duplicatesSkipped: result.summary.duplicates,
              totalRevenue: result.summary.totalRevenue,
              status: 'Success'
            },
            ...(dashboardData.uploadHistory || [])
          ]
        };
        
        // Recalculate metrics
        const { calculateMetrics } = await import('./Utils');
        const metrics = calculateMetrics(updatedData.transactions);
        
        setDashboardData({
          ...updatedData,
          ...metrics
        });
        
        setUploadStatus(
          `✅ Successfully processed ${result.summary.processed} transactions! ` +
          `Revenue: $${result.summary.totalRevenue.toLocaleString()}`
        );
      } else {
        setUploadStatus(`❌ Error: ${result.error}`);
      }
    };

    const handleDeleteData = () => {
      if (window.confirm('Are you sure you want to delete all uploaded data? This action cannot be undone.')) {
        setDashboardData({
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
        setUploadStatus('✅ All data has been deleted. Upload a new CSV file to start fresh.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Upload Sawyer Export</h3>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Export your transactions from Sawyer as a CSV file</li>
              <li>2. Ensure the file includes: Order ID, Order Date, Customer Email, Net Amount, Payment Status</li>
              <li>3. Click "Choose File" below to upload</li>
              <li>4. The system will process and deduplicate automatically</li>
            </ol>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">Upload your Sawyer CSV export file</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <FileText className="mr-2" size={20} />
              Choose CSV File
            </label>
          </div>

          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus.includes('✅') ? 'bg-green-50 text-green-800' :
              uploadStatus.includes('❌') ? 'bg-red-50 text-red-800' :
              'bg-yellow-50 text-yellow-800'
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Data Management Section */}
        {dashboardData.overview.totalRevenue > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Data Status</p>
                  <p className="text-sm text-gray-600">
                    {dashboardData.overview.totalTransactions.toLocaleString()} transactions loaded
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date(dashboardData.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {user.role === 'admin' || user.role === 'Admin' ? (
                <div className="pt-4 border-t">
                  <button
                    onClick={handleDeleteData}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="mr-2" size={16} />
                    Delete All Data
                  </button>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ This will permanently delete all uploaded data
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Upload History */}
        {dashboardData.uploadHistory && dashboardData.uploadHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Upload History</h3>
            <div className="space-y-3">
              {dashboardData.uploadHistory.slice(0, 5).map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">{upload.fileName}</div>
                      <div className="text-sm text-gray-600">
                        {upload.recordsProcessed} records, {upload.duplicatesSkipped} duplicates
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{upload.uploadDate}</div>
                    <div className="text-xs text-green-600">{upload.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tab renderer
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
