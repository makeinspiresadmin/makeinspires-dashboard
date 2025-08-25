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
  RefreshCw,
  Globe,
  Clock
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

  // Dashboard data state with sample data
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 2510000,
      totalTransactions: 6138,
      avgTransactionValue: 409,
      uniqueCustomers: 3547,
      newCustomersThisMonth: 142,
      returningCustomers: 3405,
      customerRetentionRate: 96.0,
      avgCustomerLifetimeValue: 708
    },
    monthlyData: [
      { month: '2023-06', revenue: 178945, transactions: 437, customers: 325, mamaroneck: 96576, nyc: 53640, chappaqua: 28729 },
      { month: '2023-07', revenue: 189234, transactions: 462, customers: 343, mamaroneck: 102166, nyc: 56760, chappaqua: 30308 },
      { month: '2023-08', revenue: 165432, transactions: 404, customers: 300, mamaroneck: 89334, nyc: 49630, chappaqua: 26468 },
      { month: '2023-09', revenue: 201567, transactions: 492, customers: 366, mamaroneck: 108846, nyc: 60470, chappaqua: 32251 },
      { month: '2023-10', revenue: 187654, transactions: 458, customers: 340, mamaroneck: 101373, nyc: 56296, chappaqua: 29985 },
      { month: '2023-11', revenue: 156789, transactions: 383, customers: 284, mamaroneck: 84666, nyc: 47037, chappaqua: 25086 },
      { month: '2023-12', revenue: 134567, transactions: 329, customers: 244, mamaroneck: 72666, nyc: 40370, chappaqua: 21531 },
      { month: '2024-01', revenue: 198765, transactions: 485, customers: 361, mamaroneck: 107273, nyc: 59596, chappaqua: 31896 },
      { month: '2024-02', revenue: 176543, transactions: 431, customers: 320, mamaroneck: 95333, nyc: 52963, chappaqua: 28247 },
      { month: '2024-03', revenue: 209876, transactions: 512, customers: 381, mamaroneck: 113333, nyc: 62938, chappaqua: 33605 },
      { month: '2024-04', revenue: 187432, transactions: 458, customers: 340, mamaroneck: 101213, nyc: 56207, chappaqua: 30012 },
      { month: '2024-05', revenue: 165234, transactions: 404, customers: 300, mamaroneck: 89226, nyc: 49570, chappaqua: 26438 },
      { month: '2024-06', revenue: 145876, transactions: 356, customers: 265, mamaroneck: 78773, nyc: 43763, chappaqua: 23340 },
      { month: '2024-07', revenue: 156789, transactions: 383, customers: 284, mamaroneck: 84666, nyc: 47037, chappaqua: 25086 },
      { month: '2024-08', revenue: 167890, transactions: 410, customers: 304, mamaroneck: 90660, nyc: 50367, chappaqua: 26863 },
      { month: '2024-09', revenue: 134567, transactions: 329, customers: 245, mamaroneck: 72666, nyc: 40370, chappaqua: 21531 },
      { month: '2024-10', revenue: 123456, transactions: 301, customers: 224, mamaroneck: 66666, nyc: 37037, chappaqua: 19753 },
      { month: '2024-11', revenue: 112345, transactions: 274, customers: 203, mamaroneck: 60666, nyc: 33704, chappaqua: 17975 },
      { month: '2024-12', revenue: 189234, transactions: 462, customers: 343, mamaroneck: 102166, nyc: 56760, chappaqua: 30308 },
      { month: '2025-01', revenue: 145678, transactions: 356, customers: 265, mamaroneck: 78666, nyc: 43707, chappaqua: 23305 },
      { month: '2025-02', revenue: 123789, transactions: 302, customers: 224, mamaroneck: 66846, nyc: 37137, chappaqua: 19806 },
      { month: '2025-03', revenue: 156234, transactions: 381, customers: 283, mamaroneck: 84366, nyc: 46870, chappaqua: 25002 },
      { month: '2025-04', revenue: 167345, transactions: 408, customers: 303, mamaroneck: 90366, nyc: 50204, chappaqua: 26775 },
      { month: '2025-05', revenue: 178456, transactions: 436, customers: 324, mamaroneck: 96366, nyc: 53565, chappaqua: 28525 },
      { month: '2025-06', revenue: 189567, transactions: 463, customers: 344, mamaroneck: 102366, nyc: 56870, chappaqua: 30331 },
      { month: '2025-07', revenue: 198765, transactions: 485, customers: 361, mamaroneck: 107273, nyc: 59596, chappaqua: 31896 },
      { month: '2025-08', revenue: 156789, transactions: 383, customers: 284, mamaroneck: 84666, nyc: 47037, chappaqua: 25086 }
    ],
    programPerformance: [
      { 
        name: 'Semester Programs', 
        value: 854370,
        revenue: 854370,
        transactions: 1572,
        percentage: 34.0,
        avgTransactionValue: 543
      },
      { 
        name: 'Weekly Programs', 
        value: 627450,
        revenue: 627450,
        transactions: 1487,
        percentage: 25.0,
        avgTransactionValue: 422
      },
      { 
        name: 'Drop-in Sessions', 
        value: 377250,
        revenue: 377250,
        transactions: 1354,
        percentage: 15.0,
        avgTransactionValue: 278
      },
      { 
        name: 'Birthday Parties', 
        value: 314700,
        revenue: 314700,
        transactions: 654,
        percentage: 12.5,
        avgTransactionValue: 481
      },
      { 
        name: 'Summer Camps', 
        value: 188820,
        revenue: 188820,
        transactions: 298,
        percentage: 7.5,
        avgTransactionValue: 634
      },
      { 
        name: 'Workshops & MakeJams', 
        value: 125640,
        revenue: 125640,
        transactions: 428,
        percentage: 5.0,
        avgTransactionValue: 294
      },
      { 
        name: 'Other Programs', 
        value: 25110,
        revenue: 25110,
        transactions: 89,
        percentage: 1.0,
        avgTransactionValue: 282
      }
    ],
    locations: [
      { 
        location: 'Mamaroneck', 
        revenue: 1355400, 
        transactions: 3314,
        avgTransactionValue: 409,
        marketShare: 54.0
      },
      { 
        location: 'NYC', 
        revenue: 753000, 
        transactions: 1839,
        avgTransactionValue: 409,
        marketShare: 30.0
      },
      { 
        location: 'Chappaqua', 
        revenue: 401600, 
        transactions: 985,
        avgTransactionValue: 408,
        marketShare: 16.0
      }
    ],
    transactions: [],
    uploadHistory: []
  });

  // Authentication system
  const demoCredentials = {
    'admin@makeinspires.com': { password: 'password123', role: 'admin', name: 'Admin User' },
    'manager@makeinspires.com': { password: 'password123', role: 'manager', name: 'Manager User' },
    'viewer@makeinspires.com': { password: 'password123', role: 'viewer', name: 'Viewer User' }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('makeInspires_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    const credential = demoCredentials[normalizedEmail];
    
    if (credential && credential.password === password) {
      const userData = { email: normalizedEmail, role: credential.role, name: credential.name };
      setUser(userData);
      localStorage.setItem('makeInspires_user', JSON.stringify(userData));
      setAuthError('');
      setEmail('');
      setPassword('');
    } else {
      setAuthError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('makeInspires_user');
  };

  // Enhanced CSV parsing function with better precision
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] === ',' || (inQuotes && i < line.length - 1 && line[i+1] === ','))) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse date function
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    // Handle MM/DD/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
    }
    
    // Handle other formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Normalize location names (FIXED: Enhanced NYC detection)
  const normalizeLocation = (location) => {
    if (!location) return 'Other';
    
    const loc = location.toLowerCase().trim();
    
    if (loc.includes('mamaroneck') || loc.includes('westchester')) {
      return 'Mamaroneck';
    } else if (loc.includes('nyc') || loc.includes('new york') || loc.includes('manhattan') || 
               loc.includes('upper east side') || loc.includes('east side')) {
      return 'NYC';
    } else if (loc.includes('chappaqua')) {
      return 'Chappaqua';
    } else if (loc.includes('partner') || loc.includes('external')) {
      return 'Partners';
    }
    
    return location;
  };

  // Categorize programs
  const categorizeProgram = (itemType, activityName = '') => {
    if (!itemType) return 'Other Programs';
    
    const type = itemType.toLowerCase();
    const activity = activityName.toLowerCase();
    
    if (type.includes('semester') || activity.includes('semester')) {
      return 'Semester Programs';
    } else if (type.includes('weekly') || type.includes('week') || activity.includes('weekly')) {
      return 'Weekly Programs';
    } else if (type.includes('dropin') || type.includes('drop-in') || type.includes('drop in')) {
      return 'Drop-in Sessions';
    } else if (type.includes('party') || type.includes('birthday') || activity.includes('party')) {
      return 'Birthday Parties';
    } else if ((type.includes('camp') || activity.includes('camp')) && 
               (type.includes('summer') || activity.includes('summer'))) {
      return 'Summer Camps';
    } else if (type.includes('workshop') || type.includes('makejam') || 
               activity.includes('workshop') || activity.includes('makejam')) {
      return 'Workshops & MakeJams';
    } else if (type.includes('package') || type.includes('bundle')) {
      return 'Package Deals';
    }
    
    return 'Other Programs';
  };

  // FIXED: Enhanced CSV processing with proper Order ID deduplication
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
      console.log('📊 CSV Headers detected:', headers.length, 'columns');
      
      // Column mapping with enhanced detection
      const requiredColumns = {
        'Order ID': headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('id')),
        'Order Date': headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('date')),
        'Customer Email': headers.findIndex(h => h.toLowerCase().includes('customer') && h.toLowerCase().includes('email')),
        'Net Amount to Provider': headers.findIndex(h => h.toLowerCase().includes('net') && h.toLowerCase().includes('amount')),
        'Payment Status': headers.findIndex(h => h.toLowerCase().includes('payment') && h.toLowerCase().includes('status')),
        'Item Types': headers.findIndex(h => h.toLowerCase().includes('item') && h.toLowerCase().includes('type'))
      };
      
      const optionalColumns = {
        'Order Activity Names': headers.findIndex(h => h.toLowerCase().includes('activity') && h.toLowerCase().includes('name')),
        'Order Locations': headers.findIndex(h => h.toLowerCase().includes('location')),
        'Provider Name': headers.findIndex(h => h.toLowerCase().includes('provider'))
      };
      
      // Validate required columns
      const missingColumns = Object.entries(requiredColumns)
        .filter(([name, index]) => index === -1)
        .map(([name]) => name);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      console.log('✅ Column mapping successful');
      console.log('📈 Processing transactions with enhanced deduplication...');
      
      const transactions = [];
      const seenOrderIds = new Map(); // Use Map to track first occurrence
      let processedCount = 0;
      let duplicateCount = 0;
      let filteredCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          if (values.length < headers.length - 5) continue; // Allow for some missing trailing columns
          
          const orderId = values[requiredColumns['Order ID']]?.toString().trim();
          const orderDate = values[requiredColumns['Order Date']]?.toString().trim();
          const customerEmail = values[requiredColumns['Customer Email']]?.toString().trim();
          const netAmountRaw = values[requiredColumns['Net Amount to Provider']];
          const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
          const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
          
          // Enhanced filtering logic with detailed logging
          if (!orderId || !orderDate || !customerEmail || paymentStatus !== 'Succeeded') {
            filteredCount++;
            continue;
          }
          
          // Enhanced number parsing with precision handling
          let netAmount = 0;
          if (typeof netAmountRaw === 'number') {
            netAmount = netAmountRaw;
          } else if (typeof netAmountRaw === 'string') {
            // Remove any currency symbols and commas
            const cleanAmount = netAmountRaw.replace(/[$,]/g, '');
            netAmount = parseFloat(cleanAmount);
          }
          
          if (isNaN(netAmount) || netAmount <= 0) {
            filteredCount++;
            continue;
          }
          
          // CRITICAL FIX: Proper Order ID deduplication
          if (seenOrderIds.has(orderId)) {
            duplicateCount++;
            console.log(`⚠️ Duplicate Order ID found: ${orderId} (skipping)`);
            continue;
          }
          seenOrderIds.set(orderId, true);
          
          const activityName = optionalColumns['Order Activity Names'] !== undefined && optionalColumns['Order Activity Names'] >= 0
            ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
            : '';
          const location = optionalColumns['Order Locations'] !== undefined && optionalColumns['Order Locations'] >= 0
            ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
            : '';
          const providerName = optionalColumns['Provider Name'] !== undefined && optionalColumns['Provider Name'] >= 0
            ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
            : '';
          
          const normalizedLocation = normalizeLocation(location);
          const programCategory = categorizeProgram(itemTypes, activityName);
          
          transactions.push({
            orderId,
            orderDate: parseDate(orderDate),
            customerEmail: customerEmail.toLowerCase(),
            netAmount: Math.round(netAmount * 100) / 100, // Round to 2 decimal places
            paymentStatus,
            itemTypes,
            activityName,
            location: normalizedLocation,
            providerName,
            programCategory
          });
          
          processedCount++;
          
        } catch (rowError) {
          console.warn(`⚠️ Error processing row ${i + 1}:`, rowError.message);
        }
      }
      
      // Enhanced processing summary with accurate metrics
      const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
      const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
      
      console.log('🎯 CSV PROCESSING COMPLETE:');
      console.log(`  📊 Total rows in CSV: ${lines.length - 1}`);
      console.log(`  ✅ Valid transactions: ${processedCount}`);
      console.log(`  🚫 Filtered out (invalid): ${filteredCount}`);
      console.log(`  🔄 Duplicates removed: ${duplicateCount}`);
      console.log(`  💰 Total revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      console.log(`  👥 Unique customers: ${uniqueCustomers}`);
      
      // Location metrics with enhanced accuracy
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
        revenue: Math.round(data.revenue * 100) / 100,
        transactions: data.transactions,
        avgTransactionValue: Math.round((data.revenue / data.transactions) * 100) / 100,
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
      
      const programPerformance = Object.entries(programMetrics).map(([name, data]) => ({
        name,
        value: Math.round(data.revenue * 100) / 100,
        revenue: Math.round(data.revenue * 100) / 100,
        transactions: data.transactions,
        percentage: Number((data.revenue / totalRevenue * 100).toFixed(1)),
        avgTransactionValue: Math.round((data.revenue / data.transactions) * 100) / 100
      })).sort((a, b) => b.revenue - a.revenue);
      
      // Monthly data for trends
      const monthlyMetrics = {};
      transactions.forEach(t => {
        const monthKey = t.orderDate.toISOString().slice(0, 7);
        if (!monthlyMetrics[monthKey]) {
          monthlyMetrics[monthKey] = { 
            revenue: 0, 
            transactions: 0,
            customers: new Set(),
            mamaroneck: 0,
            nyc: 0,
            chappaqua: 0,
            partners: 0
          };
        }
        monthlyMetrics[monthKey].revenue += t.netAmount;
        monthlyMetrics[monthKey].transactions += 1;
        monthlyMetrics[monthKey].customers.add(t.customerEmail);
        
        // Location breakdown
        const locationKey = t.location.toLowerCase().replace(/[^a-z]/g, '');
        if (monthlyMetrics[monthKey][locationKey] !== undefined) {
          monthlyMetrics[monthKey][locationKey] += t.netAmount;
        }
      });
      
      const monthlyData = Object.entries(monthlyMetrics)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          revenue: Math.round(data.revenue * 100) / 100,
          transactions: data.transactions,
          customers: data.customers.size,
          mamaroneck: Math.round(data.mamaroneck * 100) / 100,
          nyc: Math.round(data.nyc * 100) / 100,
          chappaqua: Math.round(data.chappaqua * 100) / 100,
          partners: Math.round(data.partners * 100) / 100
        }));
      
      return {
        ...dashboardData,
        overview: {
          ...dashboardData.overview,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalTransactions: transactions.length,
          avgTransactionValue: Math.round((totalRevenue / transactions.length) * 100) / 100,
          uniqueCustomers
        },
        transactions,
        locations,
        programPerformance,
        monthlyData: monthlyData.length > 0 ? monthlyData : dashboardData.monthlyData
      };
      
    } catch (error) {
      console.error('❌ CSV processing error:', error);
      throw new Error(`Failed to process CSV: ${error.message}`);
    }
  };

  // Delete data handler
  const handleDeleteData = () => {
    if (!user || user.role !== 'admin') {
      setUploadStatus('❌ Permission denied. Only Admin role can delete data.');
      return;
    }

    if (window.confirm('⚠️ WARNING: This will delete all uploaded transaction data and reset to sample data. This cannot be undone. Are you sure?')) {
      setDashboardData(prev => ({
        ...prev,
        transactions: [],
        uploadHistory: [],
        overview: {
          totalRevenue: 2510000,
          totalTransactions: 6138,
          avgTransactionValue: 409,
          uniqueCustomers: 3547,
          newCustomersThisMonth: 142,
          returningCustomers: 3405,
          customerRetentionRate: 96.0,
          avgCustomerLifetimeValue: 708
        }
      }));
      
      setUploadStatus('✅ All data deleted successfully. Dashboard reset to sample data.');
      
      // Add to upload history
      const deleteRecord = {
        fileName: 'DATA_DELETION',
        timestamp: new Date().toLocaleString(),
        totalTransactions: 0,
        totalRevenue: 0,
        status: 'Data Deleted'
      };
      
      setDashboardData(prev => ({
        ...prev,
        uploadHistory: [deleteRecord, ...prev.uploadHistory]
      }));
    }
  };

  // File upload handler with enhanced error handling
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Permission check
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      setUploadStatus('❌ Permission denied. Only Admin and Manager roles can upload files.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('❌ Please upload a CSV file.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('📊 Processing CSV file...');

    try {
      const result = await processCSVFile(file);
      setDashboardData(result);
      setUploadStatus(`✅ Successfully processed ${result.transactions.length} transactions from ${file.name}`);
      
      // Add to upload history
      const uploadRecord = {
        fileName: file.name,
        timestamp: new Date().toLocaleString(),
        totalTransactions: result.transactions.length,
        totalRevenue: result.overview.totalRevenue,
        status: 'Success'
      };
      
      setDashboardData(prev => ({
        ...prev,
        uploadHistory: [uploadRecord, ...prev.uploadHistory]
      }));

    } catch (error) {
      setUploadStatus(`❌ Error: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Date filtering logic
  const getDateRange = () => {
    const today = new Date();
    const ranges = {
      '7d': new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6m': new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000),
      '12m': new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
      'ytd': new Date(today.getFullYear(), 0, 1),
      'custom': customStartDate ? new Date(customStartDate) : null
    };
    
    return ranges[dateRange] || null;
  };

  // Filtered data calculation
  const filteredData = useMemo(() => {
    const startDate = getDateRange();
    const endDate = dateRange === 'custom' && customEndDate ? new Date(customEndDate) : new Date();
    
    let filteredTransactions = dashboardData.transactions;
    
    // Date filtering
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.orderDate) >= startDate && new Date(t.orderDate) <= endDate
      );
    }
    
    // Location filtering
    if (selectedLocation !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.location === selectedLocation);
    }
    
    // Program filtering
    if (selectedProgramType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.programCategory === selectedProgramType);
    }
    
    // Customer type filtering (simplified for demo)
    if (selectedCustomerType === 'new') {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.orderDate) >= new Date('2025-01-01'));
    } else if (selectedCustomerType === 'returning') {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.orderDate) < new Date('2025-01-01'));
    }
    
    if (filteredTransactions.length === 0) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        uniqueCustomers: 0
      };
    }
    
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(filteredTransactions.map(t => t.customerEmail)).size;
    
    return {
      totalRevenue,
      totalTransactions: filteredTransactions.length,
      avgTransactionValue: Math.round((totalRevenue / filteredTransactions.length) * 100) / 100,
      uniqueCustomers
    };
  }, [dashboardData.transactions, dateRange, customStartDate, customEndDate, selectedLocation, selectedProgramType, selectedCustomerType]);

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MakeInspires Analytics</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-sm text-red-700">{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Demo Accounts:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@makeinspires.com</p>
              <p><strong>Manager:</strong> manager@makeinspires.com</p>
              <p><strong>Viewer:</strong> viewer@makeinspires.com</p>
              <p className="mt-2"><strong>Password:</strong> password123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview tab content
  const renderOverview = () => {
    const metrics = dashboardData.transactions.length > 0 ? filteredData : dashboardData.overview;
    
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>
              <Activity className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics.avgTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Avg Transaction Value</p>
              </div>
              <TrendingUp className="text-purple-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.uniqueCustomers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Unique Customers</p>
              </div>
              <Users className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Program Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.programPerformance}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percentage}) => `${name}: ${percentage}%`}
                >
                  {dashboardData.programPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Location Performance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.locations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.monthlyData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Analytics tab content
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Advanced Analytics</h2>
          <p className="text-blue-700">Deep dive into performance metrics and business insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Comparison */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Revenue by Month</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.monthlyData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="mamaroneck" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                <Area type="monotone" dataKey="nyc" stackId="1" stroke="#10B981" fill="#10B981" />
                <Area type="monotone" dataKey="chappaqua" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Volume */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.programPerformance.map((program, index) => (
                  <tr key={program.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${program.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.transactions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${program.avgTransactionValue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{program.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Year-over-Year tab content
  const renderYoY = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-2">Year-over-Year Analysis</h2>
          <p className="text-green-700">Compare performance across different years</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">YoY Revenue Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">2024 Total</h4>
            <p className="text-3xl font-bold text-green-600">$1.8M</p>
            <p className="text-sm text-gray-600 mt-1">+15% vs 2023</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">2025 YTD</h4>
            <p className="text-3xl font-bold text-blue-600">$1.2M</p>
            <p className="text-sm text-gray-600 mt-1">+8% vs 2024 YTD</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Growth Rate</h4>
            <p className="text-3xl font-bold text-purple-600">12%</p>
            <p className="text-sm text-gray-600 mt-1">Annual average</p>
          </div>
        </div>
      </div>
    );
  };

  // Predictive Analytics tab content
  const renderPredictive = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-2">Predictive Analytics</h2>
          <p className="text-purple-700">AI-powered forecasting and trend analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Next Month</p>
                  <p className="text-sm text-blue-700">September 2025</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">$165K</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">Q4 2025</p>
                  <p className="text-sm text-green-700">Oct - Dec 2025</p>
                </div>
                <p className="text-2xl font-bold text-green-600">$485K</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold text-purple-900">2025 Total</p>
                  <p className="text-sm text-purple-700">Full year projection</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">$2.1M</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Summer Programs</span>
                  <span className="text-green-600 font-semibold">↗ Growing</span>
                </div>
                <p className="text-sm text-gray-600">25% increase expected in summer enrollment</p>
              </div>
              <div className="p-4 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Birthday Parties</span>
                  <span className="text-yellow-600 font-semibold">→ Stable</span>
                </div>
                <p className="text-sm text-gray-600">Consistent demand with seasonal variations</p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Drop-in Sessions</span>
                  <span className="text-blue-600 font-semibold">↗ Opportunity</span>
                </div>
                <p className="text-sm text-gray-600">Potential for 15% growth with marketing push</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Customers tab content
  const renderCustomers = () => {
    const metrics = dashboardData.transactions.length > 0 ? filteredData : dashboardData.overview;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
          <h2 className="text-xl font-semibold text-orange-900 mb-2">Customer Analytics</h2>
          <p className="text-orange-700">Understanding customer behavior and lifetime value</p>
        </div>

        {dashboardData.transactions.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-lg font-semibold">{metrics.uniqueCustomers}</p>
                <p className="text-sm text-gray-600">Total Unique Customers</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-lg font-semibold">
                  ${(metrics.totalRevenue / metrics.uniqueCustomers).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Average Customer Value</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-lg font-semibold">
                  {(metrics.totalTransactions / metrics.uniqueCustomers).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Transactions per Customer</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-lg font-semibold">
                  ${metrics.avgTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Avg Transaction Value</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Data</h3>
            <p className="text-gray-600">Upload transaction data to view customer analytics</p>
          </div>
        )}
      </div>
    );
  };

  // Partners tab content
  const renderPartners = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 p-6">
          <h2 className="text-xl font-semibold text-teal-900 mb-2">Partner Analytics</h2>
          <p className="text-teal-700">Partner program performance and collaboration metrics</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Globe size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner Program Analytics</h3>
          <p className="text-gray-600 mb-4">Partner collaboration and revenue sharing insights coming soon</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Clock size={16} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Expected Launch: Q4 2025</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Upload tab content
  const renderUpload = () => {
    const canUpload = user && (user.role === 'admin' || user.role === 'manager');
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">Data Upload</h2>
          <p className="text-indigo-700">Upload Sawyer transaction exports to update analytics</p>
        </div>

        {!canUpload && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <span className="font-medium text-yellow-800">Permission Required</span>
            </div>
            <p className="text-yellow-700 mt-1">Only Admin and Manager roles can upload files. Current role: {user?.role}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Data</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {canUpload ? (
                <div>
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Upload Sawyer CSV export file</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              ) : (
                <div>
                  <Lock size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Upload restricted to Admin and Manager roles</p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">{processingStatus || 'Processing...'}</p>
              </div>
            )}

            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-lg ${
                uploadStatus.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <p className="text-sm">{uploadStatus}</p>
              </div>
            )}
          </div>

          {/* Data Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Database Status</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {dashboardData.transactions.length > 0 
                    ? `${dashboardData.transactions.length.toLocaleString()} uploaded transactions`
                    : 'Using sample data'
                  }
                </p>
                
                {user && user.role === 'admin' && (
                  <button
                    onClick={handleDeleteData}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Delete All Data
                  </button>
                )}
                
                {user && user.role !== 'admin' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle size={16} className="inline mr-1" />
                      Only Admin can delete data
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Data Info</h4>
                <p className="text-sm text-blue-800">
                  • CSV files are processed with duplicate detection<br/>
                  • Only 'Succeeded' payments with positive amounts<br/>
                  • Data persists until manually deleted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload History</h3>
          
          {dashboardData.uploadHistory.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.uploadHistory.slice(0, 5).map((upload, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{upload.fileName}</p>
                    <p className="text-xs text-gray-500">{upload.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{upload.totalTransactions} transactions</p>
                    <p className="text-xs text-gray-500">${upload.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upload history</p>
          )}
        </div>

        {/* Current Database Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Database Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText size={24} className="mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{dashboardData.overview.totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-blue-800">Total Transactions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">${(dashboardData.overview.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-green-800">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users size={24} className="mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{dashboardData.overview.uniqueCustomers.toLocaleString()}</p>
              <p className="text-sm text-purple-800">Unique Customers</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <MapPin size={24} className="mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{dashboardData.locations.length}</p>
              <p className="text-sm text-orange-800">Active Locations</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MakeInspires Analytics</h1>
                <p className="text-xs text-gray-500">v45.3 - Revenue Fix</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{user.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'yoy', label: 'YoY', icon: Calendar },
              { id: 'predictive', label: 'Predictive', icon: Target },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'partners', label: 'Partners', icon: Globe },
              { id: 'upload', label: 'Upload', icon: Upload }
            ].map(tab => {
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
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Date Range Filters */}
          <div className="flex flex-wrap items-center space-x-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            {[
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' },
              { value: '90d', label: '90D' },
              { value: '6m', label: '6M' },
              { value: '12m', label: '12M' },
              { value: 'ytd', label: 'YTD' },
              { value: 'all', label: 'All' },
              { value: 'custom', label: 'Custom' }
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  dateRange === range.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {dateRange === 'custom' && (
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Additional Filters Toggle */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter size={16} />
            <span>More Filters</span>
            <ChevronDown size={16} className={`transform ${showFilterPanel ? 'rotate-180' : ''}`} />
          </button>

          {/* Collapsible Filter Panel */}
          {showFilterPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Locations</option>
                    <option value="Mamaroneck">Mamaroneck</option>
                    <option value="NYC">NYC</option>
                    <option value="Chappaqua">Chappaqua</option>
                    <option value="Partners">Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                  <select
                    value={selectedProgramType}
                    onChange={(e) => setSelectedProgramType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Programs</option>
                    <option value="Semester Programs">Semester Programs</option>
                    <option value="Weekly Programs">Weekly Programs</option>
                    <option value="Drop-in Sessions">Drop-in Sessions</option>
                    <option value="Birthday Parties">Birthday Parties</option>
                    <option value="Summer Camps">Summer Camps</option>
                    <option value="Workshops & MakeJams">Workshops & MakeJams</option>
                    <option value="Other Programs">Other Programs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                  <select
                    value={selectedCustomerType}
                    onChange={(e) => setSelectedCustomerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="returning">Returning Customers</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'yoy' && renderYoY()}
        {activeTab === 'predictive' && renderPredictive()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'partners' && renderPartners()}
        {activeTab === 'upload' && renderUpload()}
      </main>
    </div>
  );
};

export default MakeInspiresDashboard;
