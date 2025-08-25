/**
 * Utils.jsx - MakeInspires Dashboard v45.4
 * Data processing functions and helper utilities
 * Handles CSV parsing, filtering, and metric calculations
 * 
 * CHANGELOG v45.4:
 * - Added custom date range filtering support
 * - Enhanced filterTransactions to handle start/end dates
 */

// Parse CSV line handling commas in quotes
const parseCSVLine = (line) => {
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
  
  if (current) {
    result.push(current.trim());
  }
  
  return result;
};

// Parse date strings into Date objects
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Try different date formats
  const date = new Date(dateStr);
  if (!isNaN(date)) return date;
  
  // Try MM/DD/YYYY format
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const [month, day, year] = parts;
    const parsedDate = new Date(year, month - 1, day);
    if (!isNaN(parsedDate)) return parsedDate;
  }
  
  return new Date();
};

// Normalize location names
const normalizeLocation = (location) => {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('mamaroneck') || locationLower.includes('mama')) {
    return 'Mamaroneck';
  }
  if (locationLower.includes('nyc') || locationLower.includes('new york') || locationLower.includes('manhattan')) {
    return 'NYC';
  }
  if (locationLower.includes('chappaqua') || locationLower.includes('chappa')) {
    return 'Chappaqua';
  }
  if (locationLower.includes('partner') || locationLower.includes('offsite')) {
    return 'Partner';
  }
  
  return location || 'Other';
};

// Categorize programs based on item types and activity names
const categorizeProgram = (itemType, activityName) => {
  const type = (itemType || '').toLowerCase();
  const activity = (activityName || '').toLowerCase();
  
  // Semester programs
  if (type.includes('semester') || activity.includes('semester')) {
    return 'Semester Programs';
  }
  
  // Weekly classes
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

// Enhanced filter transactions with custom date range support (UPDATED in v45.4)
export const filterTransactions = (transactions, filters) => {
  if (!transactions || !Array.isArray(transactions)) return [];
  
  return transactions.filter(t => {
    // Date filter - Enhanced with custom date range
    if (filters.dateRange && filters.dateRange !== 'all') {
      const transactionDate = new Date(t.orderDate);
      
      // Handle custom date range
      if (filters.dateRange === 'custom') {
        if (filters.customStartDate || filters.customEndDate) {
          const startDate = filters.customStartDate ? new Date(filters.customStartDate) : new Date('1900-01-01');
          const endDate = filters.customEndDate ? new Date(filters.customEndDate + 'T23:59:59') : new Date('2100-12-31');
          
          if (transactionDate < startDate || transactionDate > endDate) {
            return false;
          }
        }
      } else {
        // Handle preset date ranges
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case '7d':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 90);
            break;
          case '6m':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case '12m':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case 'ytd':
            startDate = new Date(new Date().getFullYear(), 0, 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate && transactionDate < startDate) {
          return false;
        }
      }
    }
    
    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (t.location !== filters.location) return false;
    }
    
    // Program filter
    if (filters.programType && filters.programType !== 'all') {
      if (t.programCategory !== filters.programType) return false;
    }
    
    return true;
  });
};

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
];

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
        const location = optionalColumns['Order Locations'] >= 0
          ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
          : '';
        const providerName = optionalColumns['Provider Name'] >= 0
          ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
          : '';
        
        const normalizedLocation = normalizeLocation(location);
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
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.netAmount || 0), 0);
  const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
  const averageOrderValue = totalRevenue / transactions.length;
  
  // Program performance
  const programMap = {};
  transactions.forEach(t => {
    if (!programMap[t.programCategory]) {
      programMap[t.programCategory] = { revenue: 0, count: 0, customers: new Set() };
    }
    programMap[t.programCategory].revenue += t.netAmount || 0;
    programMap[t.programCategory].count++;
    programMap[t.programCategory].customers.add(t.customerEmail);
  });
  
  const programData = Object.entries(programMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    count: data.count,
    customers: data.customers.size
  }));
  
  // Location performance
  const locationMap = {};
  transactions.forEach(t => {
    if (!locationMap[t.location]) {
      locationMap[t.location] = { revenue: 0, count: 0, customers: new Set() };
    }
    locationMap[t.location].revenue += t.netAmount || 0;
    locationMap[t.location].count++;
    locationMap[t.location].customers.add(t.customerEmail);
  });
  
  const locationData = Object.entries(locationMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    count: data.count,
    customers: data.customers.size
  }));
  
  // Monthly revenue trend
  const monthlyMap = {};
  transactions.forEach(t => {
    const date = new Date(t.orderDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { revenue: 0, count: 0 };
    }
    monthlyMap[monthKey].revenue += t.netAmount || 0;
    monthlyMap[monthKey].count++;
  });
  
  const monthlyRevenue = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month: month.substring(5) + '/' + month.substring(2, 4),
      revenue: Math.round(data.revenue),
      transactions: data.count
    }));
  
  return {
    overview: {
      totalRevenue: Math.round(totalRevenue),
      uniqueCustomers,
      totalTransactions: transactions.length,
      averageOrderValue: Math.round(averageOrderValue),
      conversionRate: 0,
      customerRetention: 0
    },
    programData,
    locationData,
    monthlyRevenue
  };
};
