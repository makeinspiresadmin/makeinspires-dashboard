/**
 * MakeInspires Dashboard v45.3 - Main Component
 * @file Main dashboard component for MakeInspires business analytics platform
 * @version 45.3
 * @author MakeInspires Team
 * @date Last Modified: August 2025
 * 
 * PURPOSE:
 * This dashboard provides comprehensive business analytics for MakeInspires locations,
 * enabling data-driven decision making through transaction analysis, revenue tracking,
 * and program performance metrics.
 * 
 * STRUCTURE:
 * - Authentication & State Management (Lines 50-95)
 * - Data Processing Functions (Lines 170-450)
 * - Event Handlers (Lines 460-550)
 * - UI Helper Functions (Lines 650-700)
 * - Main Render with Tab Content (Lines 710-end)
 * 
 * KEY FEATURES:
 * - Role-based authentication (Admin, Manager, Viewer)
 * - CSV transaction data upload from Sawyer platform
 * - Real-time analytics and visualizations
 * - Multi-location revenue tracking (NYC, Mamaroneck, Chappaqua, Partners)
 * - Program categorization (semester, weekly, camps, workshops, etc.)
 * - Data persistence via browser localStorage
 * - Advanced filtering by date range, location, and program type
 * 
 * EXTERNAL DEPENDENCIES:
 * - Recharts: Data visualization library for charts and graphs
 * - Lucide-react: Icon library for UI elements
 * - React 18+: Core framework with hooks support
 * 
 * DATA SOURCES:
 * - CSV exports from Sawyer booking platform
 * - localStorage for data persistence
 * 
 * DEPLOYMENT:
 * - GitHub for version control
 * - Supabase for backend services (future integration)
 * - Vercel for hosting and deployment
 */

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

/**
 * Main Dashboard Component
 * @component
 * @returns {JSX.Element} The complete dashboard interface
 */
const MakeInspiresDashboard = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Authentication states
   * Manages user login, role verification, and session persistence
   */
  const [user, setUser] = useState(null); // Current authenticated user object
  const [loading, setLoading] = useState(true); // Global loading state for async operations
  const [email, setEmail] = useState(''); // Login form email input
  const [password, setPassword] = useState(''); // Login form password input
  const [authError, setAuthError] = useState(''); // Authentication error messages
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  /**
   * Dashboard UI states
   * Controls navigation, filtering, and display preferences
   */
  const [activeTab, setActiveTab] = useState('overview'); // Current active tab
  const [dateRange, setDateRange] = useState('all'); // Selected date filter range
  const [customStartDate, setCustomStartDate] = useState(''); // Custom date range start
  const [customEndDate, setCustomEndDate] = useState(''); // Custom date range end
  const [selectedLocation, setSelectedLocation] = useState('all'); // Location filter
  const [selectedProgramType, setSelectedProgramType] = useState('all'); // Program type filter
  const [selectedCustomerType, setSelectedCustomerType] = useState('all'); // Customer segment filter
  const [showFilterPanel, setShowFilterPanel] = useState(false); // Toggle filter panel visibility

  /**
   * Upload states
   * Manages CSV file upload process and status feedback
   */
  const [uploadStatus, setUploadStatus] = useState(''); // Upload progress/result message
  const [isUploading, setIsUploading] = useState(false); // Upload in progress flag
  const [processingStatus, setProcessingStatus] = useState(''); // CSV processing status

  /**
   * Main dashboard data state
   * Stores all processed transaction data and calculated metrics
   * Structure is maintained for backward compatibility with localStorage
   */
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      uniqueCustomers: 0
    },
    monthlyData: [], // Time series data for charts
    locations: [], // Location-based metrics
    programTypes: [], // Program category breakdown
    transactions: [], // Raw transaction records
    uploadHistory: [] // CSV upload audit trail
  });

  /**
   * Demo accounts configuration
   * IMPORTANT: These are temporary for testing/demo purposes only
   * Will be replaced with proper authentication service in production
   * Each role has specific permissions:
   * - Admin: Full system access (view, upload, delete)
   * - Manager: Data management access (view, upload, delete)
   * - Viewer: Read-only access (view only)
   */
  const DEMO_ACCOUNTS = [
    { email: 'admin@makeinspires.com', password: 'password123', role: 'Admin', name: 'Admin User' },
    { email: 'manager@makeinspires.com', password: 'password123', role: 'Manager', name: 'Manager User' },
    { email: 'viewer@makeinspires.com', password: 'password123', role: 'Viewer', name: 'Viewer User' }
  ];

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Safe localStorage wrapper
   * Provides error-resistant localStorage operations for environments
   * where localStorage might be restricted or unavailable
   * @namespace
   */
  const safeLocalStorage = {
    /**
     * Retrieve and parse item from localStorage
     * @param {string} key - Storage key to retrieve
     * @returns {any|null} Parsed value or null if not found/error
     */
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
    /**
     * Store item in localStorage as JSON
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be stringified)
     */
    set: (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.warn('localStorage error:', error);
      }
    },
    /**
     * Remove item from localStorage
     * @param {string} key - Storage key to remove
     */
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

  /**
   * Component initialization effect
   * Runs once on mount to restore user session and dashboard data
   * from localStorage if available
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Attempt to restore user session
        const savedUser = safeLocalStorage.get('makeinspiresUser');
        // Attempt to restore dashboard data
        const savedData = safeLocalStorage.get('makeinspiresData');
        
        if (savedUser) {
          setUser(savedUser);
        }
        
        // Validate and restore dashboard data with proper structure
        if (savedData && typeof savedData === 'object') {
          setDashboardData(prev => ({
            ...prev,
            ...savedData,
            // Ensure arrays are properly initialized even if missing
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

  // ============================================================================
  // DATA PROCESSING FUNCTIONS
  // ============================================================================
  // NOTE: These functions handle CSV parsing and data transformation
  // They maintain specific business rules for location and program categorization

  /**
   * Normalize location names to standard categories
   * Maps various location formats to 4 standard locations
   * @param {string} location - Raw location string from CSV
   * @param {string} providerName - Provider name as fallback for location detection
   * @returns {string} Normalized location: 'NYC', 'Chappaqua', 'Mamaroneck', or 'Partners'
   */
  const normalizeLocation = (location, providerName = '') => {
    // Default to Mamaroneck if no location data provided
    if (!location && !providerName) return 'Mamaroneck';
    
    const locationStr = (location || '').toLowerCase().trim();
    const providerStr = (providerName || '').toLowerCase().trim();
    
    // NYC location detection - includes all Manhattan locations
    if (locationStr.includes('nyc') || 
        locationStr.includes('new york') || 
        locationStr.includes('manhattan') || 
        locationStr.includes('upper east side') ||
        locationStr.includes('upper east') ||
        providerStr.includes('nyc')) {
      return 'NYC';
    }
    
    // Chappaqua location detection
    if (locationStr.includes('chappaqua') || providerStr.includes('chappaqua')) {
      return 'Chappaqua';
    }
    
    // Mamaroneck location detection
    if (locationStr.includes('mamaroneck') || providerStr.includes('mamaroneck')) {
      return 'Mamaroneck';
    }
    
    // All other locations are partner locations
    return 'Partners';
  };

  /**
   * Parse CSV line handling quoted fields and escaped characters
   * Properly handles fields containing commas and quotes
   * @param {string} line - Single line from CSV file
   * @returns {string[]} Array of parsed field values
   */
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes (two consecutive quotes)
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Only treat comma as delimiter when not inside quotes
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    // Don't forget the last field
    result.push(current.trim());
    return result;
  };

  /**
   * Parse date from various formats
   * Handles MM/DD/YYYY strings and Excel serial dates
   * @param {string|number} dateStr - Date string or Excel serial number
   * @returns {Date|null} Parsed Date object or null if invalid
   */
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    
    const cleanDateStr = dateStr.toString().trim();
    const numericDate = parseFloat(cleanDateStr);
    
    // Check if it's an Excel serial date (days since 1900-01-01)
    // Valid range: 25569 (1970-01-01) to 73050 (2100-01-01)
    if (!isNaN(numericDate) && numericDate > 25569 && numericDate < 73050) {
      try {
        // Convert Excel serial to JavaScript timestamp
        const jsDate = new Date((numericDate - 25569) * 86400 * 1000);
        if (!isNaN(jsDate.getTime())) return jsDate;
      } catch (error) {
        console.warn('Error parsing Excel serial date:', error);
      }
    }
    
    // Try standard date parsing
    try {
      const parsed = new Date(cleanDateStr);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        return parsed;
      }
    } catch (error) {
      // Continue to fallback
    }
    
    // Return current date as fallback
    return new Date();
  };

  /**
   * Categorize programs based on item types and activity names
   * Maps various program descriptions to standard categories
   * @param {string} itemTypes - Item type field from CSV
   * @param {string} activityName - Activity name field from CSV
   * @returns {string} Program category: semester, weekly, dropin, party, camp, workshop, or other
   */
  const categorizeProgram = (itemTypes, activityName = '') => {
    const itemType = (itemTypes || '').toLowerCase().trim();
    const activity = (activityName || '').toLowerCase().trim();
    
    // Check for specific program types in order of priority
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

  /**
   * Process uploaded CSV file and extract transaction data
   * Validates CSV structure, parses rows, and filters valid transactions
   * @param {File} file - CSV file object from file input
   * @returns {Promise<Object>} Processing result with success status and transaction array
   */
  const processCSVFile = async (file) => {
    try {
      // Read file content as text
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
      
      // Split into lines and filter empty lines
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error('CSV file appears to be empty or invalid');
      
      // Parse header row to get column indices
      const headers = parseCSVLine(lines[0]);
      
      // Map required column names to their indices
      const requiredColumns = {
        'Order ID': headers.findIndex(h => h.includes('Order ID')),
        'Order Date': headers.findIndex(h => h.includes('Order Date')),
        'Customer Email': headers.findIndex(h => h.includes('Customer Email')),
        'Net Amount to Provider': headers.findIndex(h => h.includes('Net Amount to Provider')),
        'Payment Status': headers.findIndex(h => h.includes('Payment Status')),
        'Item Types': headers.findIndex(h => h.includes('Item Types'))
      };
      
      // Map optional column names to their indices
      const optionalColumns = {
        'Order Activity Names': headers.findIndex(h => h.includes('Order Activity Names')),
        'Order Locations': headers.findIndex(h => h.includes('Order Locations')),
        'Provider Name': headers.findIndex(h => h.includes('Provider Name'))
      };
      
      // Validate all required columns are present
      const missingColumns = Object.entries(requiredColumns)
        .filter(([name, index]) => index === -1)
        .map(([name]) => name);
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      // Process each data row
      const transactions = [];
      let processedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          // Skip rows with insufficient columns
          if (values.length < headers.length - 5) continue;
          
          // Extract required fields
          const orderId = values[requiredColumns['Order ID']]?.toString().trim();
          const orderDate = values[requiredColumns['Order Date']]?.toString().trim();
          const customerEmail = values[requiredColumns['Customer Email']]?.toString().trim();
          const netAmount = parseFloat(values[requiredColumns['Net Amount to Provider']]) || 0;
          const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
          const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
          
          // Skip invalid or non-successful transactions
          if (!orderId || !orderDate || !customerEmail || netAmount <= 0 || paymentStatus !== 'Succeeded') {
            continue;
          }
          
          // Extract optional fields with defaults
          const activityName = optionalColumns['Order Activity Names'] !== undefined
            ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
            : '';
          const location = optionalColumns['Order Locations'] !== undefined
            ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
            : '';
          const providerName = optionalColumns['Provider Name'] !== undefined
            ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
            : '';
          
          // Normalize location based on business rules
          const normalizedLocation = normalizeLocation(location, providerName);
          
          // Create transaction object
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

  /**
   * Calculate dashboard metrics from transaction data
   * Generates aggregated metrics for overview, locations, programs, and time series
   * @param {Array} transactions - Array of processed transaction objects
   * @returns {Object} Complete dashboard data structure with calculated metrics
   */
  const updateDashboardMetrics = (transactions) => {
    // Handle empty or invalid input
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
    
    // Calculate overview metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
    
    // Aggregate metrics by location
    const locationMetrics = {};
    transactions.forEach(t => {
      if (!locationMetrics[t.location]) {
        locationMetrics[t.location] = { revenue: 0, transactions: 0 };
      }
      locationMetrics[t.location].revenue += t.netAmount;
      locationMetrics[t.location].transactions += 1;
    });
    
    // Format location data for display
    const locations = Object.entries(locationMetrics).map(([location, data]) => ({
      location,
      revenue: data.revenue,
      transactions: data.transactions,
      avgTransactionValue: Math.round(data.revenue / data.transactions),
      marketShare: Number((data.revenue / totalRevenue * 100).toFixed(1))
    })).sort((a, b) => b.revenue - a.revenue);
    
    // Aggregate metrics by program type
    const programMetrics = {};
    transactions.forEach(t => {
      if (!programMetrics[t.programCategory]) {
        programMetrics[t.programCategory] = { revenue: 0, transactions: 0 };
      }
      programMetrics[t.programCategory].revenue += t.netAmount;
      programMetrics[t.programCategory].transactions += 1;
    });
    
    // Format program data for display
    const programTypes = Object.entries(programMetrics).map(([category, data]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1) + ' Programs',
      category,
      revenue: data.revenue,
      transactions: data.transactions,
      avgPrice: Math.round(data.revenue / data.transactions)
    })).sort((a, b) => b.revenue - a.revenue);
    
    // Aggregate monthly time series data
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
      
      // Add location-specific revenue for stacked area chart
      const locationKey = t.location.toLowerCase().replace(' ', '');
      if (monthlyMetrics[monthKey][locationKey] !== undefined) {
        monthlyMetrics[monthKey][locationKey] += t.netAmount;
      }
    });
    
    // Sort monthly data chronologically
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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle deletion of all uploaded data
   * Restricted to Admin and Manager roles only
   * Requires user confirmation before deletion
   */
  const handleDataDeletion = () => {
    // Check role-based permissions
    if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'manager')) {
      setUploadStatus('❌ Access denied. Only Admins and Managers can delete data.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }

    // Confirm deletion with user
    if (window.confirm('Are you sure you want to delete all uploaded data? This action cannot be undone.')) {
      // Create empty dashboard state
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
        // Preserve upload history with deletion record
        uploadHistory: [...(dashboardData.uploadHistory || []), {
          filename: 'DATA_DELETION',
          uploadDate: new Date().toISOString(),
          newTransactions: 0,
          duplicatesSkipped: 0,
          action: 'All data deleted'
        }]
      };

      // Update state and localStorage
      setDashboardData(emptyDashboard);
      safeLocalStorage.set('makeinspiresData', emptyDashboard);
      setUploadStatus('✅ All data has been deleted successfully.');
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  /**
   * Handle CSV file upload and processing
   * Validates file type, processes CSV data, and updates dashboard
   * @param {Event} event - File input change event
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check role-based permissions
    if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'manager')) {
      setUploadStatus('❌ Access denied. Only Admins and Managers can upload files.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('❌ Please select a CSV file.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('🔄 Processing file...');
    
    try {
      // Process CSV file
      const result = await processCSVFile(file);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { transactions: newTransactions } = result;
      
      // Check for duplicate transactions by Order ID
      const existingOrderIds = new Set((dashboardData.transactions || []).map(t => t.orderId?.toString()));
      const filteredTransactions = newTransactions.filter(t => !existingOrderIds.has(t.orderId?.toString()));
      
      // Merge with existing transactions
      const allTransactions = [...(dashboardData.transactions || []), ...filteredTransactions];
      const updatedMetrics = updateDashboardMetrics(allTransactions);
      
      // Update dashboard with new data
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
      
      // Save to state and localStorage
      setDashboardData(updatedDashboard);
      safeLocalStorage.set('makeinspiresData', updatedDashboard);
      
      setUploadStatus(`✅ Upload complete! Added ${filteredTransactions.length} new transactions.`);
      setTimeout(() => setUploadStatus(''), 8000);
      
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 8000);
    } finally {
      setIsUploading(false);
      // Reset file input for next upload
      event.target.value = '';
    }
  };

  /**
   * Handle user login with demo accounts
   * Validates credentials against demo accounts and sets user session
   */
  const handleLogin = async () => {
    setAuthError('');
    setLoading(true);

    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials against demo accounts
    const account = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
      const userData = { 
        email: account.email, 
        role: account.role, 
        name: account.name
      };
      setUser(userData);
      // Persist session to localStorage
      safeLocalStorage.set('makeinspiresUser', userData);
    } else {
      setAuthError('Invalid credentials. Try admin@makeinspires.com with password123');
    }
    
    setLoading(false);
  };

  /**
   * Handle user logout
   * Clears session data but preserves dashboard data
   */
  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
    // Remove only user session, keep dashboard data
    safeLocalStorage.remove('makeinspiresUser');
  };

  // ============================================================================
  // DATA FILTERING & CALCULATIONS
  // ============================================================================

  /**
   * Apply filters to dashboard data
   * Filters transactions by date range, location, program type, and customer type
   * @returns {Object} Filtered dashboard metrics
   */
  const getFilteredData = () => {
    let filteredMonthly = [...(dashboardData.monthlyData || [])];
    let filteredTransactions = [...(dashboardData.transactions || [])];
    
    // Apply date range filter
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
          cutoffDate.setMonth(0, 1); // January 1st of current year
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
      
      // Filter transactions by date (except for custom range already handled)
      if (dateRange !== 'custom' && dateRange !== '6m' && dateRange !== '12m') {
        filteredTransactions = filteredTransactions.filter(t => {
          if (!t || !t.orderDate) return false;
          return new Date(t.orderDate) >= cutoffDate;
        });
      }
    }
    
    // Apply location filter
    if (selectedLocation !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t && t.location && t.location.toLowerCase() === selectedLocation.toLowerCase()
      );
    }
    
    // Apply program type filter
    if (selectedProgramType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => 
        t && t.programCategory === selectedProgramType
      );
    }
    
    // Customer type filter would be applied here if customer segmentation was implemented
    // Currently placeholder for future enhancement
    
    // Recalculate metrics for filtered data
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t?.netAmount || 0), 0);
    const totalTransactions = filteredTransactions.length;
    const uniqueCustomers = new Set(filteredTransactions.filter(t => t?.customerEmail).map(t => t.customerEmail)).size;
    
    // Recalculate location metrics for filtered data
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

  // ============================================================================
  // UI HELPER COMPONENTS & FORMATTERS
  // ============================================================================

  /**
   * Metric Card Component
   * Displays a single metric with icon and optional subtitle
   * @param {Object} props - Component props
   * @param {string} props.title - Metric title
   * @param {string} props.value - Metric value (formatted)
   * @param {string} props.subtitle - Optional subtitle text
   * @param {Component} props.icon - Lucide icon component
   * @param {string} props.color - Color theme (default: blue)
   */
  const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-blue-600">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full bg-blue-100 ml-2">
            <Icon size={20} className="text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Format month string for display in charts
   * @param {string} monthStr - Month string in YYYY-MM format
   * @returns {string} Formatted month (e.g., "Oct '23")
   */
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  /**
   * Format currency values for display
   * @param {number} amount - Numeric amount
   * @returns {string} Formatted currency string (e.g., "$1,234")
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Chart color palette for consistent visualization
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  // ============================================================================
  // MAIN COMPONENT RENDER
  // The following sections render the UI based on authentication and data state
  // ============================================================================

  // Loading state while initializing
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

  // Login screen for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Login form implementation */}
        {/* ... login UI code ... */}
      </div>
    );
  }

  // Calculate derived data for display
  const filteredData = getFilteredData();
  const currentMonth = filteredData.monthlyData && filteredData.monthlyData.length > 0 ? 
    filteredData.monthlyData[filteredData.monthlyData.length - 1] : null;
  const previousMonth = filteredData.monthlyData && filteredData.monthlyData.length > 1 ? 
    filteredData.monthlyData[filteredData.monthlyData.length - 2] : null;
  const monthlyGrowth = previousMonth && currentMonth && previousMonth.revenue ? 
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1) : '0';

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header, Navigation, Filters, and Content sections */}
      {/* ... main dashboard UI code ... */}
    </div>
  );
};

export default MakeInspiresDashboard;
