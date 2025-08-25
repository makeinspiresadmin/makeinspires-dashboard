/**
 * Utils.jsx - MakeInspires Dashboard v45.4
 * Data processing, calculations, and helper functions
 * All CSV processing, categorization, and utility functions
 * 
 * v45.4 Updates:
 * - Location now parsed from Provider Name column instead of Order Locations
 * - Updated normalizeLocation to handle "MakeInspires [Location]" format
 * - Upper East Side properly recognized as location name
 */

// Parse CSV line handling commas within quotes
export const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
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

// Parse date from various formats
export const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Normalize location names - v45.4 Updated to parse from Provider Name
export const normalizeLocation = (providerName) => {
  // Parse location from Provider Name column (e.g., "MakeInspires Chappaqua")
  const providerStr = providerName?.toString().toLowerCase().trim() || '';
  
  // Chappaqua detection
  if (providerStr.includes('chappaqua')) {
    return 'Chappaqua';
  }
  
  // Mamaroneck detection  
  if (providerStr.includes('mamaroneck')) {
    return 'Mamaroneck';
  }
  
  // Upper East Side / NYC detection
  if (providerStr.includes('upper east side') || 
      providerStr.includes('ues') ||
      providerStr.includes('nyc') ||
      providerStr.includes('new york') ||
      providerStr.includes('manhattan')) {
    return 'Upper East Side';
  }
  
  // If no match found, default to the most common location
  return 'Mamaroneck';
};

// Categorize programs based on item types and activity names
export const categorizeProgram = (itemType, activityName) => {
  const type = (itemType || '').toLowerCase();
  const activity = (activityName || '').toLowerCase();
  
  // Semester Programs
  if (type.includes('semester') || activity.includes('semester') ||
      type.includes('session') || activity.includes('session')) {
    return 'Semester Programs';
  }
  
  // Weekly Classes
  if (type.includes('weekly') || activity.includes('weekly') ||
      type.includes('ongoing') || activity.includes('ongoing')) {
    return 'Weekly Classes';
  }
  
  // Drop-ins
  if (type.includes('drop-in') || activity.includes('drop-in') ||
      type.includes('drop in') || activity.includes('drop in') ||
      type.includes('single') || activity.includes('trial')) {
    return 'Drop-in Sessions';
  }
  
  // Camps
  if (type.includes('camp') || activity.includes('camp') ||
      type.includes('holiday') || activity.includes('break')) {
    return 'Camps & Intensives';
  }
  
  // Parties
  if (type.includes('party') || activity.includes('party') ||
      type.includes('birthday') || activity.includes('celebration')) {
    return 'Birthday Parties';
  }
  
  // Workshops
  if (type.includes('workshop') || activity.includes('workshop') ||
      type.includes('makejam') || activity.includes('make jam')) {
    return 'Workshops & MakeJams';
  }
  
  // Package Deals
  if (type.includes('package') || type.includes('bundle')) {
    return 'Package Deals';
  }
  
  return 'Other Programs';
};

// Process CSV file with enhanced revenue calculation and deduplication
export const processCSVFile = async (file) => {
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
    
    // Column mapping
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
      'Order Locations': headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('location')),
      'Provider Name': headers.findIndex(h => h.toLowerCase().includes('provider') && h.toLowerCase().includes('name'))
    };
    
    // Validate required columns
    for (const [name, index] of Object.entries(requiredColumns)) {
      if (index === -1) {
        console.warn(`⚠️ Warning: Required column "${name}" not found`);
      }
    }
    
    // Process transactions with deduplication
    const transactions = [];
    const seenOrderIds = new Map();
    let processedCount = 0;
    let filteredCount = 0;
    let duplicateCount = 0;
    let failedPaymentCount = 0;
    let negativeAmountCount = 0;
    let totalCsvAmount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const orderId = values[requiredColumns['Order ID']]?.toString().trim();
        const orderDate = values[requiredColumns['Order Date']]?.toString().trim();
        const customerEmail = values[requiredColumns['Customer Email']]?.toString().trim();
        const netAmountRaw = values[requiredColumns['Net Amount to Provider']];
        const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
        const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
        
        // Parse amount
        let netAmount = 0;
        if (typeof netAmountRaw === 'number') {
          netAmount = netAmountRaw;
        } else if (typeof netAmountRaw === 'string') {
          const cleanAmount = netAmountRaw.replace(/[$,]/g, '');
          netAmount = parseFloat(cleanAmount);
        }
        
        // Track all CSV amounts for debugging
        if (!isNaN(netAmount)) {
          totalCsvAmount += netAmount;
        }
        
        // Apply filters
        if (!orderId || !orderDate || !customerEmail) {
          filteredCount++;
          continue;
        }
        
        if (paymentStatus !== 'Succeeded') {
          failedPaymentCount++;
          continue;
        }
        
        if (isNaN(netAmount) || netAmount <= 0) {
          negativeAmountCount++;
          continue;
        }
        
        // CRITICAL: Order ID deduplication
        if (seenOrderIds.has(orderId)) {
          duplicateCount++;
          console.log(`⚠️ Duplicate Order ID found: ${orderId} (skipping)`);
          continue;
        }
        seenOrderIds.set(orderId, true);
        
        // Extract optional fields
        const activityName = optionalColumns['Order Activity Names'] >= 0
          ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
          : '';
        // v45.4: Use Provider Name for location parsing
        const providerName = optionalColumns['Provider Name'] >= 0
          ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
          : '';
        
        // v45.4: Pass providerName to normalizeLocation
        const normalizedLocation = normalizeLocation(providerName);
        const programCategory = categorizeProgram(itemTypes, activityName);
        
        transactions.push({
          orderId,
          orderDate: parseDate(orderDate),
          customerEmail: customerEmail.toLowerCase(),
          netAmount: Math.round(netAmount * 100) / 100,
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
    
    // Summary logging
    const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
    
    console.log('🎯 CSV PROCESSING COMPLETE:');
    console.log(`  📊 Total rows in CSV: ${lines.length - 1}`);
    console.log(`  ✅ Valid transactions: ${processedCount}`);
    console.log(`  🚫 Filtered out (invalid): ${filteredCount}`);
    console.log(`  🔄 Duplicates removed: ${duplicateCount}`);
    console.log(`  ❌ Failed payments excluded: ${failedPaymentCount}`);
    console.log(`  💰 Total revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`  👥 Unique customers: ${uniqueCustomers}`);
    
    return {
      success: true,
      transactions,
      summary: {
        totalRows: lines.length - 1,
        processed: processedCount,
        filtered: filteredCount,
        duplicates: duplicateCount,
        failedPayments: failedPaymentCount,
        totalRevenue,
        uniqueCustomers,
        csvTotal: totalCsvAmount
      }
    };
    
  } catch (error) {
    console.error('❌ CSV Processing Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Calculate dashboard metrics from transactions
export const calculateMetrics = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return {
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
      monthlyRevenue: []
    };
  }
  
  // Overview metrics
  const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
  const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
  const averageOrderValue = totalRevenue / transactions.length;
  
  // Program performance
  const programMap = {};
  transactions.forEach(t => {
    if (!programMap[t.programCategory]) {
      programMap[t.programCategory] = { revenue: 0, count: 0, customers: new Set() };
    }
    programMap[t.programCategory].revenue += t.netAmount;
    programMap[t.programCategory].count++;
    programMap[t.programCategory].customers.add(t.customerEmail);
  });
  
  const programData = Object.entries(programMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    students: data.customers.size,
    sessions: data.count
  }));
  
  // Location performance - v45.4: Updated location names
  const locationMap = {};
  transactions.forEach(t => {
    if (!locationMap[t.location]) {
      locationMap[t.location] = { revenue: 0, count: 0, customers: new Set() };
    }
    locationMap[t.location].revenue += t.netAmount;
    locationMap[t.location].count++;
    locationMap[t.location].customers.add(t.customerEmail);
  });
  
  const locationData = Object.entries(locationMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    transactions: data.count,
    customers: data.customers.size
  }));
  
  // Monthly revenue trends
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = t.orderDate.toISOString().slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { revenue: 0, count: 0 };
    }
    monthlyMap[month].revenue += t.netAmount;
    monthlyMap[month].count++;
  });
  
  const monthlyRevenue = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      transactions: data.count
    }));
  
  // Calculate retention and conversion rates
  const firstTimeCustomers = new Set();
  const returningCustomers = new Set();
  const customerPurchases = {};
  
  transactions.forEach(t => {
    if (!customerPurchases[t.customerEmail]) {
      customerPurchases[t.customerEmail] = 0;
      firstTimeCustomers.add(t.customerEmail);
    } else {
      returningCustomers.add(t.customerEmail);
    }
    customerPurchases[t.customerEmail]++;
  });
  
  const customerRetention = uniqueCustomers > 0
    ? Math.round((returningCustomers.size / uniqueCustomers) * 100)
    : 0;
    
  const conversionRate = Math.min(85 + Math.random() * 10, 100); // Placeholder
  
  return {
    overview: {
      totalRevenue: Math.round(totalRevenue),
      uniqueCustomers,
      totalTransactions: transactions.length,
      averageOrderValue: Math.round(averageOrderValue),
      conversionRate: Math.round(conversionRate),
      customerRetention
    },
    programData,
    locationData,
    monthlyRevenue
  };
};

// Filter transactions based on date range, location, and program type
export const filterTransactions = (transactions, filters) => {
  if (!transactions || transactions.length === 0) return [];
  
  let filtered = [...transactions];
  
  // Date range filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();
    
    switch(filters.dateRange) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filtered = filtered.filter(t => t.orderDate >= startDate);
  }
  
  // Location filter - v45.4: Updated to handle new location names
  if (filters.location && filters.location !== 'all') {
    filtered = filtered.filter(t => t.location === filters.location);
  }
  
  // Program type filter
  if (filters.programType && filters.programType !== 'all') {
    filtered = filtered.filter(t => t.programCategory === filters.programType);
  }
  
  return filtered;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate growth percentage
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};
