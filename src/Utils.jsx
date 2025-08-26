/**
 * Utils.jsx - MakeInspires Dashboard v46.0
 * Data processing functions and helper utilities
 * Handles CSV parsing, filtering, and metric calculations
 * 
 * CHANGELOG v46.0:
 * - Fixed Program Distribution categories:
 *   - Parties: Item Types = 'party'
 *   - Semester: Item Types = 'semester'
 *   - Camps: Activity Name includes 'summer' OR (Item Types = 'camp' AND Activity includes 'summer')
 *   - Workshops: ALL drop-in sessions OR (Item Types = 'camp' AND Activity does NOT include 'summer')
 *   - Private: Item Types = 'pack'
 *   - Other: free trials, gift cards, and unmatched items
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
// Updated v46.0: Fixed categories per requirements
const categorizeProgram = (itemType, activityName) => {
  const type = (itemType || '').toLowerCase().trim();
  const activity = (activityName || '').toLowerCase().trim();
  
  // Handle compound item types (e.g., "discount, semester")
  // Split by comma and check each part
  const itemTypeParts = type.split(',').map(part => part.trim());
  
  // 1. Camps - Activity includes "summer" (highest priority)
  if (activity.includes('summer')) {
    return 'Camps';
  }
  
  // 2. Parties - Item Types includes 'party'
  if (itemTypeParts.includes('party')) {
    return 'Parties';
  }
  
  // 3. Semester - Item Types includes 'semester' or variants
  if (itemTypeParts.includes('semester') || 
      itemTypeParts.includes('semester_multiday') || 
      itemTypeParts.includes('free_semester')) {
    return 'Semester';
  }
  
  // 4. Camps - Item Types = 'camp' AND Activity includes 'summer' (already handled above)
  // Also handle camps without summer as Workshops
  if (itemTypeParts.includes('camp')) {
    // If we're here, activity doesn't include 'summer' (checked above)
    return 'Workshops';
  }
  
  // 5. Workshops - ALL drop-in sessions OR camps without summer
  if (itemTypeParts.includes('dropin') || 
      itemTypeParts.includes('free_dropin') ||
      itemTypeParts.includes('drop-in') ||
      itemTypeParts.includes('drop_in')) {
    return 'Workshops';
  }
  
  // 6. Private - Item Types includes 'pack'
  if (itemTypeParts.includes('pack')) {
    return 'Private';
  }
  
  // 7. Weekly programs - Check if summer (goes to Camps) or regular
  if (itemTypeParts.includes('weekly')) {
    // Summer weekly programs already caught by summer check above
    // Non-summer weekly programs go to Other
    return 'Other';
  }
  
  // 8. Other - Free trials, gift cards, and everything else
  if (itemTypeParts.includes('gift_card') || 
      itemTypeParts.includes('free_trial') ||
      type === '' || type === 'null') {
    return 'Other';
  }
  
  // Default fallback
  return 'Other';
};

// Filter transactions based on selected filters
export const filterTransactions = (transactions, filters) => {
  if (!transactions || !Array.isArray(transactions)) return [];
  
  return transactions.filter(t => {
    // Date range filtering with custom date support
    if (filters.dateRange && filters.dateRange !== 'all') {
      const transactionDate = new Date(t.orderDate);
      const now = new Date();
      
      if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Include full end day
        if (transactionDate < start || transactionDate > end) return false;
      } else {
        let daysBack = 0;
        
        switch (filters.dateRange) {
          case '7d': daysBack = 7; break;
          case '30d': daysBack = 30; break;
          case '90d': daysBack = 90; break;
          case '6m': daysBack = 180; break;
          case '12m': daysBack = 365; break;
          case 'ytd':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            if (transactionDate < yearStart) return false;
            break;
          default:
            break;
        }
        
        if (daysBack > 0) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysBack);
          if (transactionDate < cutoffDate) return false;
        }
      }
    }
    
    // Location filtering
    if (filters.location && filters.location !== 'all') {
      if (t.location !== filters.location) return false;
    }
    
    // Program type filtering
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
        const netAmount = parseFloat(values[requiredColumns['Net Amount to Provider']] || 0);
        const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
        const itemTypes = values[requiredColumns['Item Types']]?.toString().trim() || '';
        
        // Optional fields
        const activityName = optionalColumns['Order Activity Names'] >= 0
          ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
          : '';
        const location = optionalColumns['Order Locations'] >= 0
          ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
          : '';
        const providerName = optionalColumns['Provider Name'] >= 0
          ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
          : '';
        
        // Skip invalid rows
        if (!orderId || !customerEmail) {
          filteredCount++;
          continue;
        }
        
        // Track all amounts for debugging
        if (paymentStatus === 'Succeeded') {
          totalCsvAmount += netAmount;
        }
        
        // Check for duplicates
        if (seenOrderIds.has(orderId)) {
          duplicateCount++;
          continue;
        }
        
        // Skip failed payments
        if (paymentStatus !== 'Succeeded') {
          failedPaymentCount++;
          continue;
        }
        
        // Skip negative or zero amounts
        if (netAmount <= 0) {
          negativeAmountCount++;
          continue;
        }
        
        seenOrderIds.set(orderId, true);
        
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
    uniqueCustomers: data.customers.size,
    avgTransaction: Math.round(data.revenue / data.count)
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Location performance
  const locationMap = {};
  transactions.forEach(t => {
    if (!locationMap[t.location]) {
      locationMap[t.location] = { revenue: 0, count: 0 };
    }
    locationMap[t.location].revenue += t.netAmount || 0;
    locationMap[t.location].count++;
  });
  
  const locationData = Object.entries(locationMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    count: data.count
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Monthly revenue
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = new Date(t.orderDate).toISOString().slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { revenue: 0, count: 0 };
    }
    monthlyMap[month].revenue += t.netAmount || 0;
    monthlyMap[month].count++;
  });
  
  const monthlyRevenue = Object.entries(monthlyMap)
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      transactions: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Customer retention calculation
  const customerPurchases = {};
  transactions.forEach(t => {
    if (!customerPurchases[t.customerEmail]) {
      customerPurchases[t.customerEmail] = 0;
    }
    customerPurchases[t.customerEmail]++;
  });
  
  const repeatCustomers = Object.values(customerPurchases).filter(count => count > 1).length;
  const customerRetention = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
  
  return {
    overview: {
      totalRevenue: Math.round(totalRevenue),
      uniqueCustomers,
      totalTransactions: transactions.length,
      averageOrderValue: Math.round(averageOrderValue),
      conversionRate: 0, // Would need additional data to calculate
      customerRetention: Math.round(customerRetention)
    },
    programData,
    locationData,
    monthlyRevenue
  };
};

// Export all functions
export default {
  filterTransactions,
  processCSVFile,
  calculateMetrics,
  CHART_COLORS
};
