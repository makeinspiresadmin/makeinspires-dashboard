import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  User, 
  Lock, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  MapPin,
  Activity,
  Target,
  BarChart3,
  Filter,
  LogOut,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const MakeInspiresDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedProgramType, setSelectedProgramType] = useState('all');
  const [selectedCustomerType, setSelectedCustomerType] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      uniqueCustomers: 0
    },
    monthlyData: [],
    locations: [],
    programTypes: [],
    transactions: [],
    uploadHistory: []
  });

  const DEMO_ACCOUNTS = [
    { email: 'admin@makeinspires.com', password: 'password123', role: 'Admin', name: 'Admin User' },
    { email: 'manager@makeinspires.com', password: 'password123', role: 'Manager', name: 'Manager User' },
    { email: 'viewer@makeinspires.com', password: 'password123', role: 'Viewer', name: 'Viewer User' }
  ];

  const safeLocalStorage = {
    get: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.warn('localStorage error:', error);
      }
    },
    remove: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('localStorage error:', error);
      }
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedUser = safeLocalStorage.get('makeinspiresUser');
        const savedData = safeLocalStorage.get('makeinspiresData');
        
        if (savedUser) {
          setUser(savedUser);
        }
        
        if (savedData && typeof savedData === 'object') {
          setDashboardData(prev => ({
            ...prev,
            ...savedData,
            transactions: savedData.transactions || [],
            monthlyData: savedData.monthlyData || [],
            locations: savedData.locations || [],
            programTypes: savedData.programTypes || [],
            uploadHistory: savedData.uploadHistory || []
          }));
        }
      } catch (error) {
        console.warn('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const normalizeLocation = (location, providerName = '') => {
    if (!location && !providerName) return 'Mamaroneck';
    
    const locationStr = (location || '').toLowerCase().trim();
    const providerStr = (providerName || '').toLowerCase().trim();
    
    if (locationStr.includes('nyc') || 
        locationStr.includes('new york') || 
        locationStr.includes('manhattan') || 
        locationStr.includes('upper east side') ||
        locationStr.includes('upper east') ||
        providerStr.includes('nyc')) {
      return 'NYC';
    }
    
    if (locationStr.includes('chappaqua') || providerStr.includes('chappaqua')) {
      return 'Chappaqua';
    }
    
    if (locationStr.includes('mamaroneck') || providerStr.includes('mamaroneck')) {
      return 'Mamaroneck';
    }
    
    return 'Partners';
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    result.push(current.trim());
    return result;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    
    const cleanDateStr = dateStr.toString().trim();
    const numericDate = parseFloat(cleanDateStr);
    
    if (!isNaN(numericDate) && numericDate > 25569 && numericDate < 73050) {
      try {
        const jsDate = new Date((numericDate - 25569) * 86400 * 1000);
        if (!isNaN(jsDate.getTime())) return jsDate;
      } catch (error) {
        console.warn('Error parsing Excel serial date:', error);
      }
    }
    
    try {
      const parsed = new Date(cleanDateStr);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        return parsed;
      }
    } catch (error) {
      // Continue to fallback
    }
    
    return new Date();
  };

  const categorizeProgram = (itemTypes, activityName = '') => {
    const itemType = (itemTypes || '').toLowerCase().trim();
    const activity = (activityName || '').toLowerCase().trim();
    
    if (itemType.includes('semester') || activity.includes('semester')) {
      return 'semester';
    } else if (itemType.includes('weekly') || activity.includes('weekly')) {
      return 'weekly';  
    } else if (itemType.includes('dropin') || itemType.includes('drop-in') || activity.includes('drop-in')) {
      return 'dropin';
    } else if (itemType.includes('party') || itemType.includes('birthday') || activity.includes('party') || activity.includes('birthday')) {
      return 'party';
    } else if (itemType.includes('camp') || activity.includes('camp')) {
      return 'camp';
    } else if (itemType.includes('workshop') || itemType.includes('makejam') || activity.includes('workshop') || activity.includes('makejam')) {
      return 'workshop';
    } else {
      return 'other';
    }
  };

  const processCSVFile = async (file) => {
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('CSV file appears to be empty or invalid');
      
      const headers = parseCSVLine(lines[0]);
      
      const requiredColumns = {
        'Order ID': headers.findIndex(h => h.includes('Order ID')),
        'Order Date': headers.findIndex(h => h.includes('Order Date')),
        'Customer Email': headers.findIndex(h => h.includes('Customer Email')),
        'Net Amount to Provider': headers.findIndex(h => h.includes('Net Amount to Provider')),
        'Payment Status': headers.findIndex(h => h.includes('Payment Status')),
        'Item Types': headers.findIndex(h => h.includes('Item Types'))
      };
      
      const optionalColumns = {
        'Order Activity Names': headers.findIndex(h => h.includes('Order Activity Names')),
        'Order Locations': headers.findIndex(h => h.includes('Order Locations')),
        'Provider Name': headers.findIndex(h => h.includes('Provider Name'))
      };
      
      const missingColumns = Object.entries(requiredColumns)
        .filter(([name, index]) => index === -1)
        .map(([name]) => name);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      const transactions = [];
      let processedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length - 5) continue;
          
          const orderId = values[requiredColumns['Order ID']]?.toString().trim();
          const orderDate = values[requiredColumns['Order Date']]?.toString().trim();
          const customerEmail = values[requiredColumns['Customer Email']]?.toString().trim();
          const netAmount = parseFloat(values[requiredColumns['Net Amount to Provider']]) || 0;
          const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
          const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
          
          if (!orderId || !orderDate || !customerEmail || netAmount <= 0 || paymentStatus !== 'Succeeded') {
            continue;
          }
          
          const activityName = optionalColumns['Order Activity Names'] !== undefined
            ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
            : '';
          const location = optionalColumns['Order Locations'] !== undefined
            ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
            : '';
          const providerName = optionalColumns['Provider Name'] !== undefined
            ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
            : '';
          
          const normalizedLocation = normalizeLocation(location, providerName);
          
          transactions.push({
            orderId,
            orderDate: parseDate(orderDate),
            customerEmail: customerEmail.toLowerCase(),
            netAmount,
            paymentStatus,
            itemTypes,
            activityName,
            location: normalizedLocation,
            programCategory: categorizeProgram(itemTypes, activityName)
          });
          
          processedCount++;
        } catch (rowError) {
          console.warn(`Row ${i + 1} processing error:`, rowError);
        }
      }
      
      return {
        success: true,
        transactions,
        totalRows: lines.length - 1,
        processedRows: processedCount
      };
      
    } catch (error) {
      console.error('CSV processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const updateDashboardMetrics = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {
        overview: {
          totalRevenue: 0,
          totalTransactions: 0,
          avgTransactionValue: 0,
          uniqueCustomers: 0
        },
        monthlyData: [],
        locations: [],
        programTypes: [],
        transactions: [],
        uploadHistory: dashboardData.uploadHistory || []
      };
    }
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
    
    const locationMetrics = {};
    transactions.forEach(t => {
      if (!locationMetrics[t.location]) {
        locationMetrics[t.location] = { revenue: 0, transactions: 0 };
      }
      locationMetrics[t.location].revenue += t.netAmount;
      locationMetrics[t.location].transactions += 1;
    });
    
    const locations = Object.entries(locationMetrics).map(([location, data]) => ({
      location,
      revenue: data.revenue,
      transactions: data.transactions,
      avgTransactionValue: Math.round(data.revenue / data.transactions),
      marketShare: Number((data.revenue / totalRevenue * 100).toFixed(1))
    })).sort((a, b) => b.revenue - a.revenue);
    
    const programMetrics = {};
    transactions.forEach(t => {
      if (!programMetrics[t.programCategory]) {
        programMetrics[t.programCategory] = { revenue: 0, transactions: 0 };
      }
      programMetrics[t.programCategory].revenue += t.netAmount;
      programMetrics[t.programCategory].transactions += 1;
    });
    
    const programTypes = Object.entries(programMetrics).map(([category, data]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1) + ' Programs',
      category,
      revenue: data.revenue,
      transactions: data.transactions,
      avgPrice: Math.round(data.revenue / data.transactions)
    })).sort((a, b) => b.revenue - a.revenue);
    
    const monthlyMetrics = {};
    transactions.forEach(t => {
      const monthKey = t.orderDate.toISOString().slice(0, 7);
      if (!monthlyMetrics[monthKey]) {
        monthlyMetrics[monthKey] = { 
          revenue: 0, 
          transactions: 0,
          mamaroneck: 0,
          nyc: 0,
          chappaqua: 0,
          partners: 0
        };
      }
      monthlyMetrics[monthKey].revenue += t.netAmount;
      monthlyMetrics[monthKey].transactions += 1;
      
      const locationKey = t.location.toLowerCase().replace(' ', '');
      if (monthlyMetrics[monthKey][locationKey] !== undefined) {
        monthlyMetrics[monthKey][locationKey] += t.netAmount;
      }
    });
    
    const monthlyData = Object.entries(monthlyMetrics)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data
      }));
    
    return {
      overview: {
        totalRevenue,
        totalTransactions: transactions.length,
        avgTransactionValue: Math.round(totalRevenue / transactions.length),
        uniqueCustomers
      },
      transactions,
      locations,
      programTypes,
      monthlyData,
      uploadHistory: dashboardData.uploadHistory || []
    };
  };

  const handleDataDeletion = () => {
    if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'manager')) {
      setUploadStatus('Access denied. Only Admins and Managers can delete data.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }

    if (window.confirm('Are you sure you want to delete all uploaded data? This action cannot be undone.')) {
      const emptyDashboard = {
        overview: {
          totalRevenue: 0,
          totalTransactions: 0,
          avgTransactionValue: 0,
          uniqueCustomers: 0
        },
        monthlyData: [],
        locations: [],
        programTypes: [],
        transactions: [],
        uploadHistory: [...(dashboardData.uploadHistory || []), {
          filename: 'DATA_DELETION',
          uploadDate: new Date().toISOString(),
          action: 'All data deleted'
        }]
      };

      setDashboardData(emptyDashboard);
      safeLocalStorage.set('makeinspiresData', emptyDashboard);
      setUploadStatus('All data has been deleted successfully.');
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'manager')) {
      setUploadStatus('Access denied. Only Admins and Managers can upload files.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('Please select a CSV file.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Processing file...');
    
    try {
      const result = await processCSVFile(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { transactions: newTransactions } = result;
      
      const existingOrderIds = new Set((dashboardData.transactions || []).map(t => t.orderId?.toString()));
      const filteredTransactions = newTransactions.filter(t => !existingOrderIds.has(t.orderId?.toString()));
      
      const allTransactions = [...(dashboardData.transactions || []), ...filteredTransactions];
      const updatedMetrics = updateDashboardMetrics(allTransactions);
      
      const updatedDashboard = {
        ...updatedMetrics,
        uploadHistory: [
          ...(dashboardData.uploadHistory || []),
          {
            filename: file.name,
            uploadDate: new Date().toISOString(),
            newTransactions: filteredTransactions.length,
            duplicatesSkipped: newTransactions.length - filteredTransactions.length
          }
        ]
      };
      
      setDashboardData(updatedDashboard);
      safeLocalStorage.set('makeinspiresData', updatedDashboard);
      
      setUploadStatus(`Upload complete! Added ${filteredTransactions.length} new transactions.`);
      setTimeout(() => setUploadStatus(''), 8000);
      
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 8000);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const account = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
      const userData = { 
        email: account.email, 
        role: account.role, 
        name: account.name
      };
      setUser(userData);
      safeLocalStorage.set('makeinspiresUser', userData);
    } else {
      setAuthError('Invalid credentials. Try admin@makeinspires.com with password123');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
    safeLocalStorage.remove('makeinspiresUser');
  };

  const getFilteredData = () => {
    let filteredMonthly = [...(dashboardData.monthlyData || [])];
    let filteredTransactions = [...(dashboardData.transactions || [])];
    
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch(dateRange) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '6m':
          cutoffDate.setMonth(now.getMonth() - 6);
          filteredMonthly = filteredMonthly.slice(-6);
          break;
        case '12m':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          filteredMonthly = filteredMonthly.slice(-12);
          break;
        case 'ytd':
          cutoffDate.setMonth(0, 1);
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            filteredTransactions = filteredTransactions.filter(t => {
              if (!t || !t.orderDate) return false;
              const transactionDate = new Date(t.orderDate);
              return transactionDate >= startDate && transactionDate <= endDate;
            });
          }
          break;
      }
      
      if (dateRange !== 'custom' && dateRange !== '6m' && dateRange !== '12m') {
        filteredTransactions = filteredTransactions.filter(t => {
          if (!t || !t.orderDate) return false;
          return new Date(t.orderDate) >= cutoffDate;
        });
      }
    }
    
    if (selectedLocation !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t && t.location && t.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }
    
    if (selectedProgramType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t && t.programCategory === selectedProgramType
      );
    }
    
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t?.netAmount || 0), 0);
    const totalTransactions = filteredTransactions.length;
    const uniqueCustomers = new Set(filteredTransactions.filter(t => t?.customerEmail).map(t => t.customerEmail)).size;
    
    const locationMetrics = {};
    filteredTransactions.forEach(t => {
      if (!t || !t.location) return;
      if (!locationMetrics[t.location]) {
        locationMetrics[t.location] = { revenue: 0, transactions: 0 };
      }
      locationMetrics[t.location].revenue += (t.netAmount || 0);
      locationMetrics[t.location].transactions += 1;
    });
    
    const locations = Object.entries(locationMetrics).map(([location, data]) => ({
      location,
      revenue: data.revenue,
      transactions: data.transactions,
      avgTransactionValue: data.transactions > 0 ? Math.round(data.revenue / data.transactions) : 0,
      marketShare: totalRevenue > 0 ? Number((data.revenue / totalRevenue * 100).toFixed(1)) : 0
    })).sort((a, b) => b.revenue - a.revenue);
    
    return {
      overview: {
        totalRevenue,
        totalTransactions,
        avgTransactionValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
        uniqueCustomers
      },
      monthlyData: filteredMonthly,
      locations,
      transactions: filteredTransactions
    };
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-blue-600">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>

      {/* Filters Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3 gap-4">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex space-x-2">
                {['7d', '30d', '90d', '6m', '12m', 'ytd', 'all'].map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center space-x-2 px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={16} />
                <span className="text-sm">Filters</span>
                <ChevronDown size={14} className={`transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {filteredData.overview.totalTransactions.toLocaleString()} transactions • {formatCurrency(filteredData.overview.totalRevenue)}
            </div>
          </div>

          {showFilterPanel && (
            <div className="border-t border-gray-200 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="mamaroneck">Mamaroneck</option>
                    <option value="nyc">NYC</option>
                    <option value="chappaqua">Chappaqua</option>
                    <option value="partners">Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                  <select
                    value={selectedProgramType}
                    onChange={(e) => setSelectedProgramType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Programs</option>
                    <option value="semester">Semester Programs</option>
                    <option value="weekly">Weekly Programs</option>
                    <option value="dropin">Drop-in Sessions</option>
                    <option value="party">Birthday Parties</option>
                    <option value="camp">Summer Camps</option>
                    <option value="workshop">Workshops & MakeJams</option>
                    <option value="other">Other Programs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    value={selectedCustomerType}
                    onChange={(e) => setSelectedCustomerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="returning">Returning Customers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner Programs</h3>
              <p className="text-gray-600">Coming soon - Partner analytics and performance tracking</p>
            </div>
          </div>
        )}

        {activeTab === 'yoy' && (
          <div className="space-y-6">
            {dashboardData.transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No YoY Data</h3>
                <p className="text-gray-600">Upload transaction data to view year-over-year trends.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Year-over-Year Growth</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Monthly Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="space-y-6">
            {dashboardData.transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictive Data</h3>
                <p className="text-gray-600">Upload transaction data to view revenue forecasting.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Forecasting</h3>
                <p className="text-gray-600 mb-4">Predictive analytics based on historical trends and seasonal patterns.</p>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Historical Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
          <div className="p-3 rounded-full bg-blue-100 ml-2">
            <Icon size={20} className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw size={20} className="animate-spin text-blue-600" />
          <span className="text-gray-600">Loading MakeInspires Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MakeInspires</h1>
            <p className="text-gray-600 mt-2">Business Analytics Dashboard</p>
            <p className="text-sm text-blue-600 mt-1">v45.3 - Data Management</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@makeinspires.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="password123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <span>Sign In</span>}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Admin: admin@makeinspires.com</div>
              <div>Manager: manager@makeinspires.com</div>
              <div>Viewer: viewer@makeinspires.com</div>
              <div className="font-medium mt-2">Password: password123</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const currentMonth = filteredData.monthlyData && filteredData.monthlyData.length > 0 ? 
    filteredData.monthlyData[filteredData.monthlyData.length - 1] : null;
  const previousMonth = filteredData.monthlyData && filteredData.monthlyData.length > 1 ? 
    filteredData.monthlyData[filteredData.monthlyData.length - 2] : null;
  const monthlyGrowth = previousMonth && currentMonth && previousMonth.revenue ? 
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MakeInspires</h1>
                  <p className="text-xs text-gray-500">v45.3</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'yoy', label: 'YoY', icon: TrendingUp },
              { id: 'predictive', label: 'Predictive', icon: Target },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'partners', label: 'Partners', icon: MapPin },
              { id: 'upload', label: 'Upload', icon: Upload }
            ].map(tab => (
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
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {dashboardData.transactions.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">Upload CSV transaction data to view analytics and insights.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Upload size={16} className="mr-2" />
                  Go to Upload
                </button>
              </div>
            )}

            {dashboardData.transactions.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(filteredData.overview.totalRevenue)}
                    subtitle={`${Number(monthlyGrowth) > 0 ? '+' : ''}${monthlyGrowth}% vs last month`}
                    icon={DollarSign}
                  />
                  <MetricCard
                    title="Total Transactions"
                    value={filteredData.overview.totalTransactions.toLocaleString()}
                    subtitle="successful payments"
                    icon={FileText}
                  />
                  <MetricCard
                    title="Avg Transaction"
                    value={formatCurrency(filteredData.overview.avgTransactionValue)}
                    subtitle="per transaction"
                    icon={Target}
                  />
                  <MetricCard
                    title="Unique Customers"
                    value={filteredData.overview.uniqueCustomers.toLocaleString()}
                    subtitle="total customers"
                    icon={Users}
                  />
                </div>

                {filteredData.locations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Location Revenue Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={filteredData.locations.slice(0, 3)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" />
                        <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                        <Bar dataKey="revenue" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {filteredData.monthlyData.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Monthly Revenue by Location</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={filteredData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickFormatter={formatMonth} />
                        <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value), name]}
                          labelFormatter={(label) => formatMonth(label)}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="mamaroneck" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Mamaroneck" />
                        <Area type="monotone" dataKey="nyc" stackId="1" stroke="#10B981" fill="#10B981" name="NYC" />
                        <Area type="monotone" dataKey="chappaqua" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Chappaqua" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                  {dashboardData.programTypes.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold mb-4">Program Revenue Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dashboardData.programTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                          >
                            {dashboardData.programTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {filteredData.locations.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
                      <div className="space-y-4">
                        {filteredData.locations.map((location) => (
                          <div key={location.location} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{location.location}</h4>
                              <p className="text-sm text-gray-600">{location.transactions.toLocaleString()} transactions</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(location.revenue)}</p>
                              <p className="text-sm text-gray-600">{location.marketShare}% share</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {dashboardData.transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
                <p className="text-gray-600">Upload transaction data to view detailed analytics.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Program Performance Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.programTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.programTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            {dashboardData.transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Data</h3>
                <p className="text-gray-600">Upload transaction data to view customer analytics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Total Customers"
                  value={filteredData.overview.uniqueCustomers.toLocaleString()}
                  icon={Users}
                />
                <MetricCard
                  title="Avg Customer Value"
                  value={formatCurrency(Math.round(filteredData.overview.totalRevenue / filteredData.overview.uniqueCustomers))}
                  icon={DollarSign}
                />
                <MetricCard
                  title="Customer Retention"
                  value="87.2%"
                  icon={Target}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager') ? (
              <>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Upload Transaction Data</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-900">Upload Sawyer Export File</p>
                        <p className="text-gray-600">Choose CSV file from your computer</p>
                        <p className="text-sm text-gray-500">Supported format: CSV (from Sawyer dashboard export)</p>
                      </div>
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <span className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            <Upload size={20} className="mr-2" />
                            {isUploading ? 'Processing...' : 'Choose File'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {uploadStatus && (
                      <div className={`p-4 rounded-lg ${
                        uploadStatus.includes('complete') ? 'bg-green-50 text-green-800' :
                        uploadStatus.includes('failed') || uploadStatus.includes('denied') ? 'bg-red-50 text-red-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {uploadStatus.includes('complete') ? <CheckCircle size={20} /> :
                           uploadStatus.includes('failed') || uploadStatus.includes('denied') ? <AlertCircle size={20} /> :
                           <RefreshCw size={20} className="animate-spin" />}
                          <span>{uploadStatus}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {dashboardData.uploadHistory && dashboardData.uploadHistory.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Upload History</h3>
                      <button
                        onClick={handleDataDeletion}
                        disabled={isUploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400"
                      >
                        <X size={16} />
                        <span>Delete All Data</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {dashboardData.uploadHistory.slice(-5).reverse().map((upload, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{upload.filename}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(upload.uploadDate).toLocaleDateString()}
                              {upload.action ? ` • ${upload.action}` : ` • ${upload.newTransactions} new transactions`}
                            </p>
                          </div>
                          <FileText size={20} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
                <p className="text-gray-600">Only Admins and Managers can upload transaction data.</p>
                <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeInspiresDashboard;
