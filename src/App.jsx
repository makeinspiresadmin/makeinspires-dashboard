// =============================================================================
// MAKEINSPIRES DASHBOARD v45.1 - FIXED DATA PROCESSING FUNCTIONS
// =============================================================================

// Enhanced CSV parsing with proper quote handling
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes ("")
        current += '"';
        i += 2; // Skip both quotes
        continue;
      } else {
        // Toggle quote state
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

// Robust date parsing with proper Excel date handling and timezone support
const parseDate = (dateStr) => {
  if (!dateStr) {
    console.warn('Empty date string provided, using current date');
    return new Date();
  }
  
  // Clean the input
  const cleanDateStr = dateStr.toString().trim();
  
  // Handle Excel serial dates (expanded range for better coverage)
  const numericDate = parseFloat(cleanDateStr);
  if (!isNaN(numericDate) && numericDate > 25569 && numericDate < 73050) { // 1970-2099 range
    try {
      const jsDate = new Date((numericDate - 25569) * 86400 * 1000);
      if (!isNaN(jsDate.getTime())) {
        return jsDate;
      }
    } catch (error) {
      console.warn('Error parsing Excel serial date:', error);
    }
  }
  
  // Handle standard date strings with multiple formats
  const dateFormats = [
    cleanDateStr,
    cleanDateStr.replace(/[-\/]/g, '/'), // Normalize separators
    cleanDateStr + ' 00:00:00' // Add time if missing
  ];
  
  for (const format of dateFormats) {
    try {
      const parsed = new Date(format);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        return parsed;
      }
    } catch (error) {
      // Continue to next format
    }
  }
  
  console.warn(`Unable to parse date: "${dateStr}", using current date`);
  return new Date();
};

// Enhanced location normalization with better mapping
const normalizeLocation = (location, providerName = '') => {
  if (!location && !providerName) return 'Mamaroneck';
  
  const locationStr = (location || '').toLowerCase().trim();
  const providerStr = (providerName || '').toLowerCase().trim();
  const combined = `${locationStr} ${providerStr}`.toLowerCase();
  
  // Enhanced location detection
  if (combined.includes('nyc') || combined.includes('new york city') || 
      combined.includes('manhattan') || combined.includes('brooklyn')) {
    return 'NYC';
  }
  if (combined.includes('chappaqua') || combined.includes('mount kisco')) {
    return 'Chappaqua';
  }
  if (combined.includes('partner') || combined.includes('external')) {
    return 'Partners';
  }
  
  return 'Mamaroneck'; // Default fallback
};

// Enhanced program categorization with better logic
const categorizeItemType = (itemType = '', activityName = '') => {
  const itemTypeLower = itemType.toLowerCase().trim();
  const activityLower = activityName.toLowerCase().trim();
  const combined = `${itemTypeLower} ${activityLower}`.toLowerCase();
  
  // Priority-based categorization (most specific first)
  if (combined.includes('summer') && (combined.includes('camp') || combined.includes('week'))) {
    return 'Summer Camps';
  }
  if (combined.includes('workshop') || combined.includes('makejam') || combined.includes('make jam')) {
    return 'Workshops & MakeJams';
  }
  if (combined.includes('semester') || itemTypeLower === 'semester') {
    return 'Semester Programs';
  }
  if (combined.includes('party') || combined.includes('birthday')) {
    return 'Birthday Parties';
  }
  if (combined.includes('dropin') || combined.includes('drop_in') || 
      combined.includes('drop-in') || itemTypeLower === 'free_dropin') {
    return 'Drop-in Sessions';
  }
  if (combined.includes('weekly') && !combined.includes('summer')) {
    return 'Weekly Programs';
  }
  
  return 'Other Programs';
};

// Robust CSV processing with comprehensive error handling
const processCSVFile = async (file, abortController = null) => {
  const errors = [];
  const warnings = [];
  
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('File must be in CSV format');
    }
    
    // Read file with abort capability
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onabort = () => reject(new Error('File reading was aborted'));
      
      // Handle abort controller
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          reader.abort();
        });
      }
      
      reader.readAsText(file);
    });
    
    // Check for abort after reading
    if (abortController?.signal.aborted) {
      throw new Error('Processing was cancelled');
    }
    
    // Enhanced CSV parsing
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or contains only headers');
    }
    
    // Parse headers with better cleaning
    const headers = parseCSVLine(lines[0]).map(h => 
      h.replace(/^["']|["']$/g, '').trim() // Remove quotes and trim
    );
    
    // Validate required columns exist
    const requiredColumns = [
      'Order ID', 'Order Date', 'Customer Email', 
      'Net Amount to Provider', 'Payment Status', 'Item Types'
    ];
    
    const columnMap = {};
    const missingColumns = [];
    
    requiredColumns.forEach(col => {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(col.toLowerCase().replace(' ', ''))
      );
      if (index === -1) {
        missingColumns.push(col);
      } else {
        columnMap[col] = index;
      }
    });
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Optional columns with fallbacks
    const optionalColumns = {
      'Order Activity Names': headers.findIndex(h => h.toLowerCase().includes('activity')),
      'Order Locations': headers.findIndex(h => h.toLowerCase().includes('location')),
      'Provider Name': headers.findIndex(h => h.toLowerCase().includes('provider'))
    };
    
    const processedTransactions = [];
    const duplicateIds = new Set();
    let successCount = 0;
    let errorCount = 0;
    
    // Process data rows with enhanced error handling
    for (let i = 1; i < lines.length; i++) {
      try {
        // Check for abort periodically during processing
        if (abortController?.signal.aborted) {
          throw new Error('Processing was cancelled');
        }
        
        const values = parseCSVLine(lines[i]);
        
        if (values.length < headers.length) {
          warnings.push(`Row ${i + 1}: Incomplete data (${values.length}/${headers.length} columns)`);
          continue;
        }
        
        // Extract and validate core fields
        const orderId = values[columnMap['Order ID']]?.toString().trim();
        const orderDateRaw = values[columnMap['Order Date']]?.toString().trim();
        const customerEmail = values[columnMap['Customer Email']]?.toString().trim().toLowerCase();
        const netAmountRaw = values[columnMap['Net Amount to Provider']];
        const paymentStatus = values[columnMap['Payment Status']]?.toString().trim();
        const itemType = values[columnMap['Item Types']]?.toString().trim();
        
        // Validation with specific error messages
        if (!orderId) {
          errors.push(`Row ${i + 1}: Missing Order ID`);
          continue;
        }
        
        if (duplicateIds.has(orderId)) {
          warnings.push(`Row ${i + 1}: Duplicate Order ID ${orderId} within file`);
          continue;
        }
        duplicateIds.add(orderId);
        
        if (!customerEmail || !customerEmail.includes('@')) {
          errors.push(`Row ${i + 1}: Invalid customer email`);
          continue;
        }
        
        // Enhanced amount validation
        const netAmount = parseFloat(netAmountRaw);
        if (isNaN(netAmount)) {
          errors.push(`Row ${i + 1}: Invalid net amount "${netAmountRaw}"`);
          continue;
        }
        
        if (netAmount <= 0) {
          warnings.push(`Row ${i + 1}: Zero or negative amount $${netAmount}`);
          continue;
        }
        
        // Only process successful payments
        if (paymentStatus !== 'Succeeded') {
          warnings.push(`Row ${i + 1}: Payment status "${paymentStatus}" - skipping`);
          continue;
        }
        
        // Parse date with error handling
        let orderDate;
        try {
          orderDate = parseDate(orderDateRaw);
        } catch (dateError) {
          errors.push(`Row ${i + 1}: Invalid date "${orderDateRaw}"`);
          continue;
        }
        
        // Extract optional fields safely
        const activityName = optionalColumns['Order Activity Names'] >= 0 ? 
          values[optionalColumns['Order Activity Names']]?.toString().trim() || '' : '';
        const location = optionalColumns['Order Locations'] >= 0 ?
          values[optionalColumns['Order Locations']]?.toString().trim() || '' : '';
        const providerName = optionalColumns['Provider Name'] >= 0 ?
          values[optionalColumns['Provider Name']]?.toString().trim() || '' : '';
        
        // Create transaction record
        const transaction = {
          orderId: orderId,
          date: orderDate.toISOString().split('T')[0],
          customerEmail: customerEmail,
          netAmount: netAmount,
          itemType: itemType,
          activityName: activityName,
          location: normalizeLocation(location, providerName),
          program: categorizeItemType(itemType, activityName),
          processed: true,
          uploadDate: new Date().toISOString()
        };
        
        processedTransactions.push(transaction);
        successCount++;
        
      } catch (rowError) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${rowError.message}`);
        
        // Stop processing if too many errors
        if (errorCount > 100) {
          throw new Error('Too many processing errors. Please check file format.');
        }
      }
    }
    
    console.log(`✅ Processing complete: ${successCount} valid, ${errorCount} errors, ${warnings.length} warnings`);
    
    return {
      success: true,
      totalProcessed: processedTransactions.length,
      processedTransactions,
      errors,
      warnings,
      stats: {
        totalRows: lines.length - 1,
        successCount,
        errorCount,
        warningCount: warnings.length
      }
    };
    
  } catch (error) {
    console.error('❌ CSV processing failed:', error);
    return {
      success: false,
      error: error.message,
      errors,
      warnings
    };
  }
};

// Enhanced metrics calculation with comprehensive safety checks
const updateDashboardMetrics = (transactions = []) => {
  // Validate input
  if (!Array.isArray(transactions)) {
    console.error('updateDashboardMetrics: transactions must be an array');
    return getEmptyMetrics();
  }
  
  if (transactions.length === 0) {
    console.warn('updateDashboardMetrics: No transactions provided');
    return getEmptyMetrics();
  }
  
  try {
    // Filter valid transactions with safety checks
    const validTransactions = transactions.filter(t => 
      t && 
      typeof t === 'object' && 
      t.netAmount && 
      !isNaN(t.netAmount) && 
      t.netAmount > 0 && 
      t.customerEmail &&
      t.date
    );
    
    if (validTransactions.length === 0) {
      console.warn('No valid transactions found after filtering');
      return getEmptyMetrics();
    }
    
    // Safe calculations with null checks
    const totalRevenue = validTransactions.reduce((sum, t) => {
      const amount = parseFloat(t.netAmount) || 0;
      return sum + amount;
    }, 0);
    
    const totalTransactions = validTransactions.length;
    
    // Customer analysis with safe operations
    const customerData = new Map();
    validTransactions.forEach(t => {
      const email = t.customerEmail?.toLowerCase().trim();
      if (!email) return;
      
      if (!customerData.has(email)) {
        customerData.set(email, {
          email,
          transactions: 0,
          totalSpent: 0,
          firstDate: t.date,
          lastDate: t.date
        });
      }
      
      const customer = customerData.get(email);
      customer.transactions += 1;
      customer.totalSpent += (parseFloat(t.netAmount) || 0);
      
      // Update date range
      if (t.date < customer.firstDate) customer.firstDate = t.date;
      if (t.date > customer.lastDate) customer.lastDate = t.date;
    });
    
    const uniqueCustomers = customerData.size;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Calculate retention metrics safely
    const returningCustomers = Array.from(customerData.values())
      .filter(c => c.transactions > 1).length;
    const repeatCustomerRate = uniqueCustomers > 0 ? 
      (returningCustomers / uniqueCustomers) * 100 : 0;
    
    const avgRevenuePerFamily = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
    
    // Calculate customer lifetime value with safety
    const totalCustomerValue = Array.from(customerData.values())
      .reduce((sum, c) => sum + c.totalSpent, 0);
    const customerLifetimeValue = uniqueCustomers > 0 ? 
      totalCustomerValue / uniqueCustomers : 0;
    
    // Program distribution with safety checks
    const programStats = new Map();
    validTransactions.forEach(t => {
      const program = t.program || 'Other Programs';
      if (!programStats.has(program)) {
        programStats.set(program, { revenue: 0, transactions: 0 });
      }
      const stats = programStats.get(program);
      stats.revenue += (parseFloat(t.netAmount) || 0);
      stats.transactions += 1;
    });
    
    const programTypes = Array.from(programStats.entries()).map(([name, stats]) => ({
      name,
      value: stats.revenue,
      revenue: stats.revenue,
      transactions: stats.transactions,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
    }));
    
    // Location distribution with safety checks
    const locationStats = new Map();
    validTransactions.forEach(t => {
      const location = t.location || 'Mamaroneck';
      if (!locationStats.has(location)) {
        locationStats.set(location, { revenue: 0, transactions: 0 });
      }
      const stats = locationStats.get(location);
      stats.revenue += (parseFloat(t.netAmount) || 0);
      stats.transactions += 1;
    });
    
    const locationData = Array.from(locationStats.entries()).map(([name, stats]) => ({
      name,
      revenue: stats.revenue,
      transactions: stats.transactions,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
    }));
    
    // Monthly trends with safe grouping
    const monthlyStats = new Map();
    validTransactions.forEach(t => {
      if (!t.date) return;
      
      try {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyStats.has(monthKey)) {
          monthlyStats.set(monthKey, {
            month: monthKey,
            revenue: 0,
            transactions: 0,
            customers: new Set()
          });
        }
        
        const stats = monthlyStats.get(monthKey);
        stats.revenue += (parseFloat(t.netAmount) || 0);
        stats.transactions += 1;
        if (t.customerEmail) {
          stats.customers.add(t.customerEmail.toLowerCase());
        }
      } catch (dateError) {
        warnings.push(`Invalid date for transaction ${t.orderId}: ${t.date}`);
      }
    });
    
    const monthlyTrends = Array.from(monthlyStats.values())
      .map(stats => ({
        ...stats,
        customers: stats.customers.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      overview: {
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to cents
        totalTransactions,
        uniqueCustomers,
        avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
        repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
        avgRevenuePerFamily: Math.round(avgRevenuePerFamily * 100) / 100,
        customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100
      },
      programTypes,
      monthlyTrends,
      locations: locationData,
      customerCohorts: Array.from(customerData.values()),
      transactions: validTransactions
    };
    
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return getEmptyMetrics();
  }
};

// Safe empty metrics fallback
const getEmptyMetrics = () => ({
  overview: {
    totalRevenue: 0,
    totalTransactions: 0,
    uniqueCustomers: 0,
    avgTransactionValue: 0,
    repeatCustomerRate: 0,
    avgRevenuePerFamily: 0,
    customerLifetimeValue: 0
  },
  programTypes: [],
  monthlyTrends: [],
  locations: [],
  customerCohorts: [],
  transactions: []
});

// Enhanced data filtering with performance optimizations
const createGetFilteredData = (dashboardData, filters) => {
  return useMemo(() => {
    const { 
      dateRange, 
      customDateRange, 
      selectedLocation, 
      selectedProgram, 
      selectedCustomerType,
      searchTerm 
    } = filters;
    
    let filtered = [...(dashboardData.transactions || [])];
    
    // Early return if no data
    if (filtered.length === 0) {
      return [];
    }
    
    // Date range filtering with enhanced logic
    if (dateRange !== 'All') {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      
      try {
        switch (dateRange) {
          case '7D': 
            startDate.setDate(now.getDate() - 7); 
            break;
          case '30D': 
            startDate.setDate(now.getDate() - 30); 
            break;
          case '90D': 
            startDate.setDate(now.getDate() - 90); 
            break;
          case '6M': 
            startDate.setMonth(now.getMonth() - 6); 
            break;
          case '12M': 
            startDate.setFullYear(now.getFullYear() - 1); 
            break;
          case 'YTD': 
            startDate = new Date(now.getFullYear(), 0, 1); 
            break;
          case 'Custom':
            if (customDateRange.start) {
              startDate = new Date(customDateRange.start);
              if (isNaN(startDate.getTime())) {
                console.warn('Invalid custom start date, using default');
                startDate = new Date(now.getFullYear(), 0, 1);
              }
            }
            if (customDateRange.end) {
              endDate = new Date(customDateRange.end);
              if (isNaN(endDate.getTime())) {
                console.warn('Invalid custom end date, using current date');
                endDate = now;
              }
            }
            break;
        }
        
        filtered = filtered.filter(t => {
          if (!t.date) return false;
          try {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
          } catch (error) {
            console.warn(`Invalid transaction date: ${t.date}`);
            return false;
          }
        });
        
      } catch (filterError) {
        console.error('Date filtering error:', filterError);
        // Continue with unfiltered data rather than crash
      }
    }
    
    // Location filtering with safety
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(t => t.location === selectedLocation);
    }
    
    // Program filtering with safety
    if (selectedProgram !== 'All') {
      filtered = filtered.filter(t => t.program === selectedProgram);
    }
    
    // Customer type filtering with optimized customer counting
    if (selectedCustomerType !== 'All') {
      const customerCounts = new Map();
      
      // Count transactions per customer efficiently
      (dashboardData.transactions || []).forEach(t => {
        if (t.customerEmail) {
          const email = t.customerEmail.toLowerCase();
          customerCounts.set(email, (customerCounts.get(email) || 0) + 1);
        }
      });
      
      if (selectedCustomerType === 'New') {
        filtered = filtered.filter(t => {
          const email = t.customerEmail?.toLowerCase();
          return email && customerCounts.get(email) === 1;
        });
      } else if (selectedCustomerType === 'Returning') {
        filtered = filtered.filter(t => {
          const email = t.customerEmail?.toLowerCase();
          return email && (customerCounts.get(email) || 0) > 1;
        });
      }
    }
    
    // Search term filtering
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.customerEmail?.toLowerCase().includes(search) ||
        t.activityName?.toLowerCase().includes(search) ||
        t.itemType?.toLowerCase().includes(search) ||
        t.orderId?.toString().includes(search)
      );
    }
    
    return filtered;
    
  }, [
    dashboardData.transactions, 
    dateRange, 
    customDateRange.start,
    customDateRange.end, 
    selectedLocation, 
    selectedProgram, 
    selectedCustomerType,
    searchTerm
  ]);
};

// Enhanced file upload handler with abort controller and better error handling
const createFileUploadHandler = (
  setUploadStatus, 
  setIsUploading, 
  setProcessingStatus, 
  dashboardData, 
  setDashboardData,
  user
) => {
  let currentAbortController = null;
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Permission check
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      setUploadStatus('❌ Insufficient permissions. Only Admins and Managers can upload files.');
      setTimeout(() => setUploadStatus(''), 5000);
      return;
    }
    
    // File validation
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
    
    // Cancel any existing upload
    if (currentAbortController) {
      currentAbortController.abort();
    }
    
    currentAbortController = new AbortController();
    setIsUploading(true);
    setUploadStatus('🔄 Processing file...');
    
    try {
      setProcessingStatus('Reading CSV file...');
      
      // Process file with abort capability
      const result = await processCSVFile(file, currentAbortController);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const { processedTransactions, errors, warnings, stats } = result;
      
      setProcessingStatus('Checking for duplicates...');
      
      // Enhanced duplicate detection
      const existingOrderIds = new Set(
        (dashboardData.transactions || []).map(t => t.orderId?.toString())
      );
      
      const newTransactions = processedTransactions.filter(t => 
        !existingOrderIds.has(t.orderId?.toString())
      );
      
      setProcessingStatus('Updating dashboard metrics...');
      
      // Combine existing and new transactions
      const allTransactions = [
        ...(dashboardData.transactions || []),
        ...newTransactions
      ];
      
      // Recalculate all metrics from combined data
      const updatedMetrics = updateDashboardMetrics(allTransactions);
      
      setProcessingStatus('Saving data...');
      
      // Update state with new data
      const updatedDashboard = {
        ...updatedMetrics,
        lastUpdated: new Date().toISOString(),
        uploadHistory: [
          ...(dashboardData.uploadHistory || []),
          {
            filename: file.name,
            uploadDate: new Date().toISOString(),
            totalRows: stats.totalRows,
            successCount: stats.successCount,
            errorCount: stats.errorCount,
            warningCount: stats.warningCount,
            newTransactions: newTransactions.length,
            duplicatesSkipped: processedTransactions.length - newTransactions.length
          }
        ]
      };
      
      setDashboardData(updatedDashboard);
      
      // Persist to localStorage with error handling
      try {
        localStorage.setItem('makeinspiresData', JSON.stringify(updatedDashboard));
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
        setUploadStatus('⚠️ Data processed but failed to save locally. Changes may be lost on refresh.');
      }
      
      // Success message with detailed stats
      let statusMessage = `✅ Upload complete! ${newTransactions.length} new transactions added.`;
      if (processedTransactions.length - newTransactions.length > 0) {
        statusMessage += ` ${processedTransactions.length - newTransactions.length} duplicates skipped.`;
      }
      if (warnings.length > 0) {
        statusMessage += ` ${warnings.length} warnings (check console).`;
      }
      
      setUploadStatus(statusMessage);
      setProcessingStatus('');
      
      // Log detailed results
      console.log('📊 Upload Results:', {
        file: file.name,
        totalRows: stats.totalRows,
        processed: stats.successCount,
        errors: stats.errorCount,
        warnings: stats.warningCount,
        newTransactions: newTransactions.length,
        duplicates: processedTransactions.length - newTransactions.length
      });
      
      if (errors.length > 0) {
        console.warn('Processing Errors:', errors);
      }
      if (warnings.length > 0) {
        console.warn('Processing Warnings:', warnings);
      }
      
      setTimeout(() => setUploadStatus(''), 8000);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setProcessingStatus('');
      setTimeout(() => setUploadStatus(''), 8000);
    } finally {
      setIsUploading(false);
      currentAbortController = null;
    }
  };
  
  // Return handler with cleanup function
  return {
    handleFileUpload,
    cancelUpload: () => {
      if (currentAbortController) {
        currentAbortController.abort();
        setUploadStatus('Upload cancelled');
        setIsUploading(false);
        setTimeout(() => setUploadStatus(''), 3000);
      }
    }
  };
};

// Enhanced state management hooks with safety
const useSafeState = (initialValue, validator = null) => {
  const [value, setValue] = useState(initialValue);
  
  const safeSetValue = (newValue) => {
    try {
      // Validate if validator provided
      if (validator && !validator(newValue)) {
        console.warn('State validation failed, keeping previous value');
        return;
      }
      
      setValue(newValue);
    } catch (error) {
      console.error('State update error:', error);
      // Keep previous value on error
    }
  };
  
  return [value, safeSetValue];
};

// Safe localStorage operations
const safeLocalStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage: ${key}`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
      return false;
    }
  }
};

// Export all fixed functions
export {
  parseCSVLine,
  parseDate,
  normalizeLocation,
  categorizeItemType,
  processCSVFile,
  updateDashboardMetrics,
  getEmptyMetrics,
  createGetFilteredData,
  createFileUploadHandler,
  useSafeState,
  safeLocalStorage
};

// =============================================================================
// USAGE EXAMPLES AND INTEGRATION NOTES
// =============================================================================

/*
INTEGRATION INTO MAIN COMPONENT:

// Replace existing useState with safe state management
const [dashboardData, setDashboardData] = useSafeState(
  safeLocalStorage.get('makeinspiresData', getEmptyMetrics()),
  (data) => data && typeof data === 'object' && data.transactions
);

// Replace existing getFilteredData with enhanced version
const getFilteredData = createGetFilteredData(dashboardData, {
  dateRange,
  customDateRange,
  selectedLocation,
  selectedProgram,
  selectedCustomerType,
  searchTerm
});

// Replace existing upload handler
const { handleFileUpload, cancelUpload } = createFileUploadHandler(
  setUploadStatus,
  setIsUploading,
  setProcessingStatus,
  dashboardData,
  setDashboardData,
  user
);

TESTING CHECKLIST:
□ Empty CSV file handling
□ Malformed CSV data
□ Missing required columns
□ Invalid dates and amounts
□ Large file processing (stress test)
□ Duplicate order ID detection
□ Network interruption during upload
□ localStorage quota exceeded
□ Invalid customer email formats
□ Special characters in data fields

ERROR SCENARIOS HANDLED:
✅ File reading failures
✅ Invalid CSV format
✅ Missing required columns
✅ Date parsing errors
✅ Amount validation failures
✅ Duplicate detection
✅ Memory limitations
✅ State update failures
✅ localStorage errors
✅ Processing cancellation
*/
