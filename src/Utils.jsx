/**
 * Utils.jsx - MakeInspires Dashboard v45.5
 * Data processing functions and helper utilities
 * Handles CSV parsing, filtering, and metric calculations
 * 
 * CHANGELOG v45.5:
 * - Updated program categorization to new 5-category system: Parties, Semester, Camp, Workshops, Private
 * - Enhanced logic to handle compound item types (e.g., "discount, semester")
 * - Added special handling for dropin items without "workshop" in activity name
 * - Improved Camp detection to include weekly programs with summer activities
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
// Updated v45.5: New categorization rules per client requirements
const categorizeProgram = (itemType, activityName) => {
  const type = (itemType || '').toLowerCase().trim();
  const activity = (activityName || '').toLowerCase().trim();
  
  // RULE 1: Parties = Item Types Column equals 'party'
  // Handle both exact match and when 'party' is part of compound types
  if (type === 'party' || type.split(',').some(t => t.trim() === 'party')) {
    return 'Parties';
  }
  
  // RULE 2: Semester = Item Types Column equals 'semester'
  // Handle both exact match and when 'semester' is part of compound types
  if (type === 'semester' || type.includes('semester')) {
    return 'Semester';
  }
  
  // RULE 3: Camp = Item Type Column equals 'camp' while the Order Activity Names Column includes the word 'Summer'
  // Also include 'weekly' items with 'summer' in activity name (based on data analysis)
  if ((type === 'camp' || type.includes('camp') || type === 'weekly' || type.includes('weekly')) && 
      activity.includes('summer')) {
    return 'Camp';
  }
  
  // RULE 4: Workshops = Two conditions:
  // A) Item Type Column equals 'camp' while the Order Activity Names Column does NOT include the word 'Summer'
  // B) Item Type Column equals 'dropin' and the Order Activity Names Column includes the word 'Workshop'
  if ((type === 'camp' || type.includes('camp')) && !activity.includes('summer')) {
    return 'Workshops';
  }
  if ((type === 'dropin' || type.includes('dropin') || type === 'free_dropin' || type.includes('free_dropin')) && 
      (activity.includes('workshop') || activity.includes('school\'s out') || activity.includes('schools out'))) {
    return 'Workshops';
  }
  
  // RULE 5: Private = Item Types Column equals 'pack'
  if (type === 'pack' || type.includes('pack')) {
    return 'Private';
  }
  
  // Additional categorization for unmatched items
  // Handle remaining dropin items that don't have 'workshop' in activity
  if (type === 'dropin' || type.includes('dropin') || type === 'free_dropin' || type.includes('free_dropin')) {
    // Check if it's a private session
    if (activity.includes('private')) {
      return 'Private';
    }
    // Otherwise categorize as Workshops (most dropins are workshop-like activities)
    return 'Workshops';
  }
  
  // Handle remaining weekly items (not summer camps)
  if (type === 'weekly' || type.includes('weekly')) {
    return 'Semester'; // Weekly programs are similar to semester programs
  }
  
  // Handle gift cards and free trials
  if (type.includes('gift_card') || type.includes('free_trial') || type === 'free_trial') {
    return 'Private'; // Group with Private as miscellaneous revenue
  }
  
  // Fallback - log unmatched for debugging
  console.warn(`Unmatched program type: "${type}" with activity: "${activity}"`);
  return 'Workshops'; // Default fallback to Workshops instead of 'Other'
};

// Filter transactions based on date range and other criteria
export const filterTransactions = (transactions, filters) => {
  if (!transactions || !Array.isArray(transactions)) return [];
  
  return transactions.filter(t => {
    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const transactionDate = new Date(t.orderDate);
      const now = new Date();
      
      // Handle custom date range
      if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (transactionDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (transactionDate > end) return false;
        }
      } else {
        // Handle preset ranges
        let daysAgo = 0;
        switch (filters.dateRange) {
          case '7d': daysAgo = 7; break;
          case '30d': daysAgo = 30; break;
          case '90d': daysAgo = 90; break;
          case '6m': daysAgo = 180; break;
          case '12m': daysAgo = 365; break;
          case 'ytd':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            if (transactionDate < yearStart) return false;
            break;
        }
        
        if (daysAgo > 0) {
          const cutoff = new Date(now);
          cutoff.setDate(cutoff.getDate() - daysAgo);
          cutoff.setHours(0, 0, 0, 0);
          if (transactionDate < cutoff) return false;
        }
      }
    }
    
    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (t.location !== filters.location) return false;
    }
    
    // Program type filter
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
        const netAmountStr = values[requiredColumns['Net Amount to Provider']]?.toString().trim();
        const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
        const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
        
        // Parse net amount
        const netAmount = parseFloat(netAmountStr?.replace(/[$,]/g, '') || '0');
        
        // Track all amounts for reconciliation
        if (!isNaN(netAmount) && netAmount !== 0) {
          totalCsvAmount += netAmount;
        }
        
        // Skip invalid rows
        if (!orderId || !orderDate || !customerEmail) {
          filteredCount++;
          continue;
        }
        
        // Check for duplicates
        if (seenOrderIds.has(orderId)) {
          duplicateCount++;
          continue;
        }
        seenOrderIds.set(orderId, true);
        
        // Skip failed payments
        if (paymentStatus && paymentStatus.toLowerCase() !== 'succeeded') {
          failedPaymentCount++;
          continue;
        }
        
        // Skip negative or zero amounts
        if (netAmount <= 0) {
          negativeAmountCount++;
          continue;
        }
        
        // Get optional fields
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
