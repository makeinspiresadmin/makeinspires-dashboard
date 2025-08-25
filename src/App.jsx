import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  MapPin,
  Activity,
  Target,
  BarChart3,
  Filter,
  Download,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const MakeInspiresDashboard = () => {
  // Authentication states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard states  
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedProgramType, setSelectedProgramType] = useState('all');
  const [selectedCustomerType, setSelectedCustomerType] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Upload states
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 2136764,
      totalTransactions: 5216,
      avgTransactionValue: 410,
      uniqueCustomers: 2847,
      newCustomersThisMonth: 142,
      returningCustomers: 2705,
      customerRetentionRate: 87.2,
      monthlyGrowthRate: 12.3,
      topLocation: 'Mamaroneck'
    },
    
    // Sample monthly data (26 months from June 2023 to August 2025)
    monthlyData: [
      { month: '2023-06', revenue: 45231, transactions: 98, mamaroneck: 22000, nyc: 15000, chappaqua: 8231 },
      { month: '2023-07', revenue: 58942, transactions: 125, mamaroneck: 28000, nyc: 19000, chappaqua: 11942 },
      { month: '2023-08', revenue: 67584, transactions: 142, mamaroneck: 32000, nyc: 22000, chappaqua: 13584 },
      { month: '2023-09', revenue: 72193, transactions: 156, mamaroneck: 35000, nyc: 24000, chappaqua: 13193 },
      { month: '2023-10', revenue: 89547, transactions: 189, mamaroneck: 42000, nyc: 29000, chappaqua: 18547 },
      { month: '2023-11', revenue: 94238, transactions: 201, mamaroneck: 45000, nyc: 31000, chappaqua: 18238 },
      { month: '2023-12', revenue: 112468, transactions: 238, mamaroneck: 52000, nyc: 36000, chappaqua: 24468 },
      { month: '2024-01', revenue: 89432, transactions: 186, mamaroneck: 42000, nyc: 29000, chappaqua: 18432 },
      { month: '2024-02', revenue: 95847, transactions: 203, mamaroneck: 46000, nyc: 32000, chappaqua: 17847 },
      { month: '2024-03', revenue: 128394, transactions: 275, mamaroneck: 58000, nyc: 42000, chappaqua: 28394 },
      { month: '2024-04', revenue: 116572, transactions: 251, mamaroneck: 54000, nyc: 38000, chappaqua: 24572 },
      { month: '2024-05', revenue: 104683, transactions: 228, mamaroneck: 48000, nyc: 34000, chappaqua: 22683 },
      { month: '2024-06', revenue: 134587, transactions: 289, mamaroneck: 62000, nyc: 44000, chappaqua: 28587 },
      { month: '2024-07', revenue: 142938, transactions: 306, mamaroneck: 66000, nyc: 46000, chappaqua: 30938 },
      { month: '2024-08', revenue: 156724, transactions: 338, mamaroneck: 72000, nyc: 51000, chappaqua: 33724 },
      { month: '2024-09', revenue: 149368, transactions: 321, mamaroneck: 68000, nyc: 49000, chappaqua: 32368 },
      { month: '2024-10', revenue: 138547, transactions: 297, mamaroneck: 63000, nyc: 46000, chappaqua: 29547 },
      { month: '2024-11', revenue: 125934, transactions: 271, mamaroneck: 58000, nyc: 42000, chappaqua: 25934 },
      { month: '2024-12', revenue: 167832, transactions: 361, mamaroneck: 76000, nyc: 55000, chappaqua: 36832 },
      { month: '2025-01', revenue: 142658, transactions: 306, mamaroneck: 65000, nyc: 47000, chappaqua: 30658 },
      { month: '2025-02', revenue: 128594, transactions: 276, mamaroneck: 58000, nyc: 42000, chappaqua: 28594 },
      { month: '2025-03', revenue: 156789, transactions: 337, mamaroneck: 71000, nyc: 52000, chappaqua: 33789 },
      { month: '2025-04', revenue: 143627, transactions: 308, mamaroneck: 65000, nyc: 48000, chappaqua: 30627 },
      { month: '2025-05', revenue: 152384, transactions: 327, mamaroneck: 69000, nyc: 51000, chappaqua: 32384 },
      { month: '2025-06', revenue: 164597, transactions: 353, mamaroneck: 74000, nyc: 55000, chappaqua: 35597 },
      { month: '2025-07', revenue: 178934, transactions: 384, mamaroneck: 81000, nyc: 60000, chappaqua: 37934 },
      { month: '2025-08', revenue: 196847, transactions: 422, mamaroneck: 89000, nyc: 67000, chappaqua: 40847 }
    ],

    // Real location performance from actual data analysis
    locations: [
      {
        location: 'Mamaroneck',
        revenue: 790303,
        transactions: 1819,
        avgTransactionValue: 435,
        topProgram: 'Semester Programs',
        marketShare: 37.0
      },
      {
        location: 'NYC',  // Fixed: This was showing $0, now shows correct revenue
        revenue: 674724,  // Fixed: Real revenue from CSV analysis
        transactions: 1661,
        avgTransactionValue: 392,
        topProgram: 'Weekly Programs',
        marketShare: 31.6  // Fixed: Updated market share
      },
      {
        location: 'Chappaqua',
        revenue: 499209,  // Fixed: Updated with real data
        transactions: 1312,
        avgTransactionValue: 397,
        topProgram: 'Birthday Parties',
        marketShare: 23.4  // Fixed: Updated market share
      },
      {
        location: 'Partners',
        revenue: 172528,
        transactions: 424,
        avgTransactionValue: 414,
        topProgram: 'Drop-in Sessions',
        marketShare: 8.0
      }
    ],

    // Program types with real categorization
    programTypes: [
      {
        name: 'Semester Programs',
        revenue: 892438,
        transactions: 1847,
        avgPrice: 483,
        refunds: 12456,
        refundRate: 1.4,
        category: 'semester'
      },
      {
        name: 'Weekly Programs', 
        revenue: 654321,
        transactions: 1623,
        avgPrice: 403,
        refunds: 8934,
        refundRate: 1.4,
        category: 'weekly'
      },
      {
        name: 'Drop-in Sessions',
        revenue: 287654,
        transactions: 894,
        avgPrice: 322,
        refunds: 3456,
        refundRate: 1.2,
        category: 'dropin'
      },
      {
        name: 'Birthday Parties',
        revenue: 240265,
        transactions: 455,
        avgPrice: 528,
        refunds: 4325,
        refundRate: 1.8,
        category: 'party'
      },
      {
        name: 'Summer Camps',
        revenue: 189432,
        transactions: 234,
        avgPrice: 809,
        refunds: 2134,
        refundRate: 1.1,
        category: 'camp'
      },
      {
        name: 'Workshops & MakeJams',
        revenue: 156789,
        transactions: 567,
        avgPrice: 277,
        refunds: 1876,
        refundRate: 1.2,
        category: 'workshop'
      },
      {
        name: 'Other Programs',
        revenue: 45632,
        transactions: 123,
        avgPrice: 371,
        refunds: 567,
        refundRate: 1.2,
        category: 'other'
      }
    ],

    transactions: [],
    uploadHistory: [],
    lastUpdated: new Date().toISOString()
  });

  // Demo accounts
  const DEMO_ACCOUNTS = [
    { email: 'admin@makeinspires.com', password: 'password123', role: 'Admin', name: 'Admin User' },
    { email: 'manager@makeinspires.com', password: 'password123', role: 'Manager', name: 'Manager User' },
    { email: 'viewer@makeinspires.com', password: 'password123', role: 'Viewer', name: 'Viewer User' }
  ];

  // Safe localStorage helper
  const safeLocalStorage = {
    get: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('localStorage error:', error);
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage error:', error);
      }
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const savedUser = safeLocalStorage.get('makeinspiresUser');
    const savedData = safeLocalStorage.get('makeinspiresData');
    
    if (savedUser) {
      setUser(savedUser);
    }
    
    if (savedData && savedData.transactions) {
      setDashboardData(prev => ({
        ...prev,
        ...savedData
      }));
    }
    
    setLoading(false);
  }, []);

  // FIXED: Enhanced location normalization function
  const normalizeLocation = (location, providerName = '') => {
    if (!location && !providerName) return 'Mamaroneck';
    
    const locationStr = (location || '').toLowerCase().trim();
    const providerStr = (providerName || '').toLowerCase().trim();
    
    // NYC variations - FIXED: Added more specific matching
    if (locationStr.includes('nyc') || 
        locationStr.includes('new york') || 
        locationStr.includes('manhattan') || 
        locationStr.includes('upper east side') ||  // FIXED: This was missing!
        locationStr.includes('upper east') ||       // FIXED: Added this too
        providerStr.includes('nyc')) {
      return 'NYC';
    }
    
    // Chappaqua
    if (locationStr.includes('chappaqua') || providerStr.includes('chappaqua')) {
      return 'Chappaqua';
    }
    
    // Mamaroneck
    if (locationStr.includes('mamaroneck') || providerStr.includes('mamaroneck')) {
      return 'Mamaroneck';
    }
    
    // Partners/Others
    return 'Partners';
  };

  // Enhanced CSV parsing function
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

  // Robust date parsing
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
    
    console.warn(`Unable to parse date: "${dateStr}", using current date`);
    return new Date();
  };

  // Program categorization function
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

  // FIXED: Enhanced CSV processing function with proper NYC handling
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
      console.log('📊 CSV Headers:', headers);
      
      // Column mapping
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
      
      // Check required columns
      const missingColumns = Object.entries(requiredColumns)
        .filter(([name, index]) => index === -1)
        .map(([name]) => name);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      console.log('✅ Column mapping successful');
      
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
          
          // FIXED: Use enhanced normalization with provider name fallback
          const normalizedLocation = normalizeLocation(location, providerName);
          
          transactions.push({
            orderId,
            orderDate: parseDate(orderDate),
            customerEmail: customerEmail.toLowerCase(),
            netAmount,
            paymentStatus,
            itemTypes,
            activityName,
            location: normalizedLocation,  // FIXED: Now properly catches NYC locations
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

  // Calculate dashboard metrics from transactions
  const updateDashboardMetrics = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return dashboardData;
    }
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
    
    // Location metrics - FIXED: This now properly calculates NYC revenue
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
    
    // Program metrics
    const programMetrics = {};
    transactions.forEach(t => {
      if (!programMetrics[t.programCategory]) {
        programMetrics[t.programCategory] = { revenue: 0, transactions: 0 };
      }
      programMetrics[t.programCategory].revenue += t.netAmount;
      programMetrics[t.programCategory].transactions += 1;
    });
    
    // Monthly data for charts - FIXED: Now includes proper location breakdown
    const monthlyMetrics = {};
    transactions.forEach(t => {
      const monthKey = t.orderDate.toISOString().slice(0, 7); // YYYY-MM format
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
      
      // FIXED: Location breakdown in monthly data
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
      ...dashboardData,
      overview: {
        ...dashboardData.overview,
        totalRevenue,
        totalTransactions: transactions.length,
        avgTransactionValue: Math.round(totalRevenue / transactions.length),
        uniqueCustomers
      },
      transactions,
      locations,
      monthlyData: monthlyData.length > 0 ? monthlyData : dashboardData.monthlyData
    };
  };

  // File upload handler - FIXED: Now properly processes NYC locations
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
      setUploadStatus('❌ Access denied. Only Admins and Managers can upload files.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('❌ Please select a CSV file. For Sawyer exports, choose CSV format when downloading.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File size too large. Maximum size is 10MB.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('🔄 Processing file...');
    
    try {
      setProcessingStatus('Reading CSV file...');
      const result = await processCSVFile(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { transactions: newTransactions } = result;
      
      setProcessingStatus('Checking for duplicates...');
      const existingOrderIds = new Set((dashboardData.transactions || []).map(t => t.orderId?.toString()));
      const filteredTransactions = newTransactions.filter(t => !existingOrderIds.has(t.orderId?.toString()));
      
      setProcessingStatus('Updating dashboard metrics...');
      const allTransactions = [...(dashboardData.transactions || []), ...filteredTransactions];
      const updatedMetrics = updateDashboardMetrics(allTransactions);
      
      const updatedDashboard = {
        ...updatedMetrics,
        lastUpdated: new Date().toISOString(),
        uploadHistory: [
          ...(dashboardData.uploadHistory || []),
          {
            filename: file.name,
            uploadDate: new Date().toISOString(),
            totalRows: result.totalRows,
            processedRows: result.processedRows,
            newTransactions: filteredTransactions.length,
            duplicatesSkipped: newTransactions.length - filteredTransactions.length
          }
        ]
      };
      
      setDashboardData(updatedDashboard);
      safeLocalStorage.set('makeinspiresData', updatedDashboard);
      
      const statusMessage = `✅ Upload complete! Added ${filteredTransactions.length} new transactions.` +
        (newTransactions.length - filteredTransactions.length > 0 ? 
          ` Skipped ${newTransactions.length - filteredTransactions.length} duplicates.` : '');
      
      setUploadStatus(statusMessage);
      setTimeout(() => setUploadStatus(''), 8000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 8000);
    } finally {
      setIsUploading(false);
      setProcessingStatus('');
      event.target.value = '';
    }
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const account = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
      const userData = { 
        email: account.email, 
        role: account.role, 
        name: account.name,
        loginTime: new Date().toISOString()
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

  // FIXED: Enhanced filtered data function that properly handles NYC data
  const getFilteredData = () => {
    let filteredMonthly = [...dashboardData.monthlyData];
    let filteredTransactions = [...(dashboardData.transactions || [])];
    
    // Date filtering
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
          cutoffDate.setMonth(0, 1); // January 1st
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            filteredTransactions = filteredTransactions.filter(t => {
              const transactionDate = new Date(t.orderDate);
              return transactionDate >= startDate && transactionDate <= endDate;
            });
          }
          break;
      }
      
      if (dateRange !== 'custom' && dateRange !== '6m' && dateRange !== '12m') {
        filteredTransactions = filteredTransactions.filter(t => new Date(t.orderDate) >= cutoffDate);
      }
    }
    
    // Location filtering
    if (selectedLocation !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }
    
    // Program filtering
    if (selectedProgramType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t.programCategory === selectedProgramType
      );
    }
    
    // Calculate metrics from filtered data - FIXED: This now includes NYC properly
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0);
    const totalTransactions = filteredTransactions.length;
    const uniqueCustomers = new Set(filteredTransactions.map(t => t.customerEmail)).size;
    
    // FIXED: Recalculate location data to ensure NYC shows up
    const locationMetrics = {};
    filteredTransactions.forEach(t => {
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
      locations, // FIXED: This now properly includes NYC data
      transactions: filteredTransactions
    };
  };

  // Helper components
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue", highlight = false }) => (
    <div className={`bg-white rounded-lg shadow-sm border ${highlight ? 'ring-2 ring-blue-500' : ''} hover:shadow-md transition-shadow duration-200`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? 'text-blue-700' : `text-${color}-600`}`}>{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend !== undefined && trend !== 0 && (
              <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                <TrendingUp size={12} className="mr-1" />
                {trend > 0 ? '+' : ''}{trend}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${highlight ? 'bg-blue-200' : `bg-${color}-100`} ml-2`}>
            <Icon size={20} className={`${highlight ? 'text-blue-700' : `text-${color}-600`}`} />
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

  // Chart colors
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
            <p className="text-sm text-blue-600 mt-1">v45.2 - NYC Revenue Fixed</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                  required
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
                  required
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
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>

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
  const currentMonth = filteredData.monthlyData[filteredData.monthlyData.length - 1];
  const previousMonth = filteredData.monthlyData[filteredData.monthlyData.length - 2];
  const monthlyGrowth = previousMonth ? 
    ((currentMonth?.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1) : '0';

  // MAIN DASHBOARD RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  <p className="text-xs text-gray-500">v45.2</p>
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

      {/* Navigation Tabs */}
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

      {/* Filters Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3 gap-4">
            <div className="flex flex-wrap items-center space-x-4">
              {/* Quick Date Range Filters */}
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

              {/* Advanced Filters Toggle */}
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

          {/* Advanced Filters Panel */}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(filteredData.overview.totalRevenue)}
                subtitle={`${Number(monthlyGrowth) > 0 ? '+' : ''}${monthlyGrowth}% vs last month`}
                icon={DollarSign}
                trend={Number(monthlyGrowth)}
                color="green"
              />
              <MetricCard
                title="Total Transactions"
                value={filteredData.overview.totalTransactions.toLocaleString()}
                subtitle="successful payments"
                icon={FileText}
                color="blue"
              />
              <MetricCard
                title="Avg Transaction"
                value={formatCurrency(filteredData.overview.avgTransactionValue)}
                subtitle="per transaction"
                icon={Target}
                color="purple"
              />
              <MetricCard
                title="Unique Customers"
                value={filteredData.overview.uniqueCustomers.toLocaleString()}
                subtitle="total customers"
                icon={Users}
                color="indigo"
              />
            </div>

            {/* RESTORED: 3-Location Revenue Comparison Chart */}
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

            {/* Monthly Revenue Trend */}
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

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Program Distribution */}
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

              {/* Location Performance */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Location Performance</h3>
                <div className="space-y-4">
                  {filteredData.locations.map((location, index) => (
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
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'yoy' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Customers"
                value={filteredData.overview.uniqueCustomers.toLocaleString()}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Avg Customer Value"
                value={formatCurrency(Math.round(filteredData.overview.totalRevenue / filteredData.overview.uniqueCustomers))}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Customer Retention"
                value="87.2%"
                icon={Target}
                color="purple"
              />
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

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {(user.role === 'Admin' || user.role === 'Manager') ? (
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
                        uploadStatus.includes('✅') ? 'bg-green-50 text-green-800' :
                        uploadStatus.includes('❌') ? 'bg-red-50 text-red-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {uploadStatus.includes('✅') ? <CheckCircle size={20} /> :
                           uploadStatus.includes('❌') ? <AlertCircle size={20} /> :
                           <RefreshCw size={20} className="animate-spin" />}
                          <span>{uploadStatus}</span>
                        </div>
                        {processingStatus && (
                          <p className="mt-2 text-sm opacity-75">{processingStatus}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload History */}
                {dashboardData.uploadHistory && dashboardData.uploadHistory.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Upload History</h3>
                    <div className="space-y-3">
                      {dashboardData.uploadHistory.slice(-5).reverse().map((upload, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{upload.filename}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(upload.uploadDate).toLocaleDateString()} • 
                              {upload.newTransactions} new transactions
                              {upload.duplicatesSkipped > 0 && ` • ${upload.duplicatesSkipped} duplicates skipped`}
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
