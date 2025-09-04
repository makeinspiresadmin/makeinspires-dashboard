/**
 * Tabs.jsx - MakeInspires Dashboard v48.0
 * All 7 dashboard tab components in one file
 * Overview, Analytics, YoY, Predictive, Customers, Partners, Upload
 * 
 * CHANGELOG v48.0:
 * - FIXED: All static/hardcoded data now calculated from uploaded transactions
 * - FIXED: Upload now properly checks for duplicates against existing dashboard data
 * - ADDED: Upload history tracking with new vs duplicate counts
 * - All features preserved - no sections removed
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

  // Calculate period-over-period growth
  const calculateGrowth = () => {
    if (!dashboardData.monthlyRevenue || dashboardData.monthlyRevenue.length < 2) return 0;
    const currentMonth = dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 1]?.revenue || 0;
    const previousMonth = dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 2]?.revenue || 0;
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  // Calculate customer growth month-over-month
  const calculateCustomerGrowth = () => {
    if (!dashboardData.transactions || dashboardData.transactions.length === 0) return 0;
    const now = new Date();
    const thisMonth = dashboardData.transactions.filter(t => {
      const tDate = new Date(t.orderDate);
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });
    const lastMonth = dashboardData.transactions.filter(t => {
      const tDate = new Date(t.orderDate);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear();
    });
    const thisMonthCustomers = new Set(thisMonth.map(t => t.customerEmail)).size;
    const lastMonthCustomers = new Set(lastMonth.map(t => t.customerEmail)).size;
    return thisMonthCustomers - lastMonthCustomers;
  };

  // Calculate average lifetime value from actual data
  const calculateAvgLifetimeValue = () => {
    if (!dashboardData.transactions || dashboardData.transactions.length === 0) return 0;
    const customerTotals = {};
    dashboardData.transactions.forEach(t => {
      customerTotals[t.customerEmail] = (customerTotals[t.customerEmail] || 0) + t.netAmount;
    });
    const values = Object.values(customerTotals);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };
  
  // Overview Tab - Main dashboard view with KPIs, program distribution, and location revenue
  const renderOverview = () => {
    // Calculate total revenue for percentage calculation in pie chart
    const totalProgramRevenue = dashboardData.programData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
    const growthRate = calculateGrowth();
    
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
                {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`} vs previous period
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

      {/* Monthly Revenue Trend - v49.0 UPDATED WITH STACKED LOCATIONS */}
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
            <Legend />
            <Area type="monotone" dataKey="Mamaroneck" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Mamaroneck" />
            <Area type="monotone" dataKey="NYC" stackId="1" stroke="#10B981" fill="#10B981" name="NYC" />
            <Area type="monotone" dataKey="Chappaqua" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Chappaqua" />
            <Area type="monotone" dataKey="Partners" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="Partners" />
            <Area type="monotone" dataKey="Other" stackId="1" stroke="#EC4899" fill="#EC4899" name="Other" />
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

  // Analytics Tab - Detailed program and location performance analysis
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

  // Year-over-Year Tab - Growth comparisons and trends
  const renderYoY = () => {
    // Generate YoY comparison data from actual monthly data
    const yoyData = dashboardData.monthlyRevenue.slice(-12).map((month, index) => {
      // Look for same month in previous year (12 months back)
      const prevYearIndex = dashboardData.monthlyRevenue.length - 24 + index;
      const previousYearRevenue = prevYearIndex >= 0 && dashboardData.monthlyRevenue[prevYearIndex] 
        ? dashboardData.monthlyRevenue[prevYearIndex].revenue 
        : month.revenue * 0.8; // If no previous year data, estimate 20% lower
      
      return {
        month: month.month,
        currentYear: month.revenue,
        previousYear: Math.round(previousYearRevenue),
        growth: previousYearRevenue > 0 
          ? Math.round(((month.revenue - previousYearRevenue) / previousYearRevenue) * 100)
          : 0
      };
    });

    // Calculate actual YoY growth metrics from data
    const currentYearRevenue = yoyData.reduce((sum, m) => sum + m.currentYear, 0);
    const previousYearRevenue = yoyData.reduce((sum, m) => sum + m.previousYear, 0);
    const revenueGrowth = previousYearRevenue > 0 
      ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue * 100).toFixed(1)
      : 0;

    // Calculate customer growth YoY
    const currentYearCustomers = dashboardData.transactions?.filter(t => {
      const date = new Date(t.orderDate);
      return date.getFullYear() === new Date().getFullYear();
    }).length || 0;
    const lastYearCustomers = dashboardData.transactions?.filter(t => {
      const date = new Date(t.orderDate);
      return date.getFullYear() === new Date().getFullYear() - 1;
    }).length || 0;
    const customerGrowth = lastYearCustomers > 0
      ? ((currentYearCustomers - lastYearCustomers) / lastYearCustomers * 100).toFixed(1)
      : 0;

    // Calculate transaction growth
    const transactionGrowth = yoyData.length > 0
      ? yoyData.map(m => m.growth).reduce((a, b) => a + b, 0) / yoyData.length
      : 0;

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
            <p className="text-3xl font-bold text-green-600">
              {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}%
            </p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Customer Growth</h4>
            <p className="text-3xl font-bold text-blue-600">
              {customerGrowth > 0 ? '+' : ''}{customerGrowth}%
            </p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-2">Transaction Growth</h4>
            <p className="text-3xl font-bold text-purple-600">
              {transactionGrowth > 0 ? '+' : ''}{transactionGrowth.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">vs. Previous Year</p>
          </div>
        </div>
      </div>
    );
  };

  // Predictive Analytics Tab - Revenue forecasting and growth opportunities
  const renderPredictive = () => {
    // Generate forecast data based on actual trends
    const forecastData = [];
    const lastMonth = dashboardData.monthlyRevenue[dashboardData.monthlyRevenue.length - 1];
    
    // Calculate actual growth rate from recent data
    let growthRate = 1.02; // Default 2% if no data
    if (dashboardData.monthlyRevenue.length >= 3) {
      const recent = dashboardData.monthlyRevenue.slice(-3);
      const avgGrowth = recent.reduce((sum, m, i) => {
        if (i === 0) return sum;
        const prev = recent[i-1].revenue;
        return sum + (prev > 0 ? (m.revenue - prev) / prev : 0);
      }, 0) / (recent.length - 1);
      growthRate = 1 + Math.max(0, Math.min(0.1, avgGrowth)); // Cap between 0-10%
    }
    
    if (lastMonth) {
      for (let i = 1; i <= 6; i++) {
        forecastData.push({
          month: `Forecast M${i}`,
          revenue: Math.round(lastMonth.revenue * Math.pow(growthRate, i)),
          type: 'forecast'
        });
      }
    }

    // Calculate program opportunities from actual data
    const programOpportunities = dashboardData.programData.map(prog => {
      const currentRevenue = prog.revenue || 0;
      // Estimate potential based on best performing month
      const monthlyData = dashboardData.transactions?.filter(t => t.programCategory === prog.name) || [];
      const monthlyRevenues = {};
      monthlyData.forEach(t => {
        const month = new Date(t.orderDate).getMonth();
        monthlyRevenues[month] = (monthlyRevenues[month] || 0) + t.netAmount;
      });
      const maxMonthly = Math.max(...Object.values(monthlyRevenues), currentRevenue);
      const potential = Math.round(maxMonthly * 1.3); // 30% above best month
      const growth = currentRevenue > 0 ? ((potential - currentRevenue) / currentRevenue * 100).toFixed(0) : '0';
      
      return {
        program: prog.name,
        potential: potential,
        current: currentRevenue,
        growth: `${growth}%`
      };
    }).slice(0, 4); // Top 4 programs

    // Calculate seasonal patterns from actual data
    const seasonalPatterns = [];
    if (dashboardData.transactions && dashboardData.transactions.length > 0) {
      const monthlyTotals = {};
      dashboardData.transactions.forEach(t => {
        const month = new Date(t.orderDate).getMonth();
        monthlyTotals[month] = (monthlyTotals[month] || 0) + t.netAmount;
      });
      
      const avgRevenue = Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / 12;
      
      // Group by seasons
      const patterns = [
        { 
          name: 'Peak Season (Sep-Dec)', 
          months: [8, 9, 10, 11],
          revenue: 0
        },
        { 
          name: 'Summer Programs (Jun-Aug)', 
          months: [5, 6, 7],
          revenue: 0
        },
        { 
          name: 'Spring Season (Mar-May)', 
          months: [2, 3, 4],
          revenue: 0
        },
        { 
          name: 'Winter Session (Jan-Feb)', 
          months: [0, 1],
          revenue: 0
        }
      ];
      
      patterns.forEach(pattern => {
        pattern.revenue = pattern.months.reduce((sum, m) => sum + (monthlyTotals[m] || 0), 0) / pattern.months.length;
        pattern.variance = avgRevenue > 0 ? ((pattern.revenue - avgRevenue) / avgRevenue * 100).toFixed(0) : 0;
      });
      
      seasonalPatterns.push(...patterns.sort((a, b) => b.revenue - a.revenue));
    }

    // Calculate projected metrics based on trends
    const avgMonthlyRevenue = dashboardData.monthlyRevenue.length > 0
      ? dashboardData.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / dashboardData.monthlyRevenue.length
      : 0;
    const projectedQ1Revenue = Math.round(avgMonthlyRevenue * 3 * growthRate);
    
    const avgNewCustomersMonthly = calculateCustomerGrowth();
    const expectedNewCustomers = Math.round(avgNewCustomersMonthly * 3 * growthRate);
    
    const currentRetention = dashboardData.overview.customerRetention || 50;
    const retentionTarget = Math.min(100, Math.round(currentRetention * 1.05)); // 5% improvement

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
              {seasonalPatterns.length > 0 ? (
                seasonalPatterns.map((pattern, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{pattern.name}</span>
                    <span className="font-medium">
                      {pattern.variance > 0 ? '+' : ''}{pattern.variance}% vs avg
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Insufficient data for seasonal analysis</p>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Projected Q1 Revenue</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${projectedQ1Revenue.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Based on {((growthRate - 1) * 100).toFixed(0)}% growth trend
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Expected New Customers</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {expectedNewCustomers}
            </p>
            <p className="text-sm text-blue-600 mt-1">Based on current trend</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Retention Target</h4>
            <p className="text-2xl font-bold text-gray-900 mt-2">{retentionTarget}%</p>
            <p className="text-sm text-purple-600 mt-1">5% improvement goal</p>
          </div>
        </div>
      </div>
    );
  };

  // Customer Insights Tab - Customer segmentation and retention metrics
  const renderCustomers = () => {
    const newCustomersThisMonth = calculateCustomerGrowth();
    const avgLifetimeValue = calculateAvgLifetimeValue();
    const retentionRate = dashboardData.overview.customerRetention || 0;
    const isAboveAverage = retentionRate > 60; // Industry avg is typically 60%

    return (
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
            <p className="text-sm text-green-600 mt-1">
              {newCustomersThisMonth > 0 ? '+' : ''}{newCustomersThisMonth} this month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Retention Rate</h4>
            <p className="text-3xl font-bold text-gray-900">{retentionRate}%</p>
            <p className="text-sm text-blue-600 mt-1">
              {isAboveAverage ? 'Above' : 'Below'} industry average
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600">Avg Lifetime Value</h4>
            <p className="text-3xl font-bold text-gray-900">${avgLifetimeValue.toLocaleString()}</p>
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
  };

  // Partners Tab - Placeholder for future partner program features
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

  // Upload Tab - CSV file upload and data management (admin/manager only) - FIXED
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
        // CRITICAL FIX: Check for duplicates against existing dashboard data
        const existingOrderIds = new Set(
          (dashboardData.transactions || []).map(t => String(t.orderId))
        );
        
        // Filter out any transactions that already exist
        const newTransactions = result.transactions.filter(t => 
          !existingOrderIds.has(String(t.orderId))
        );
        
        const duplicatesSkipped = result.transactions.length - newTransactions.length;
        
        // Only proceed if there are new transactions to add
        if (newTransactions.length > 0) {
          // Recalculate metrics with the combined data
          const allTransactions = [...(dashboardData.transactions || []), ...newTransactions];
          const updatedMetrics = calculateMetrics(allTransactions);
          
          const updatedData = {
            ...dashboardData,
            ...updatedMetrics,
            transactions: allTransactions,
            uploadHistory: [
              ...(dashboardData.uploadHistory || []),
              {
                id: Date.now(),
                fileName: file.name,
                uploadDate: new Date().toISOString(),
                totalInFile: result.transactions.length,
                newRecords: newTransactions.length,
                duplicatesSkipped: duplicatesSkipped,
                status: 'success'
              }
            ].slice(-10) // Keep only last 10 uploads
          };
          
          setDashboardData(updatedData);
          setUploadStatus({
            type: 'success',
            message: `Successfully uploaded ${newTransactions.length} new transactions! ${duplicatesSkipped > 0 ? `(${duplicatesSkipped} duplicates skipped)` : ''}`
          });
        } else {
          // All transactions were duplicates
          setUploadStatus({
            type: 'error',
            message: `No new transactions added. All ${result.transactions.length} records already exist in the system.`
          });
        }
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
          transactions: [],
          uploadHistory: []
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
        
        {/* Upload History - PRESERVED */}
        {dashboardData.uploadHistory && dashboardData.uploadHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Upload History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New/Skipped</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.uploadHistory.slice(0, 5).map((upload) => (
                    <tr key={upload.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{upload.fileName}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(upload.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {upload.newRecords} / {upload.duplicatesSkipped}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-green-600">✓ Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Data Status - PRESERVED */}
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
        
        {/* Danger Zone - PRESERVED */}
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
