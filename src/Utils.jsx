/**
 * Utils.jsx - MakeInspires Dashboard v46.0
 * Data processing functions and helper utilities
 * Handles CSV parsing, filtering, and metric calculations
 * 
 * CONTINUITY NOTES:
 * - Part of 3-file modular architecture (App.jsx, Tabs.jsx, Utils.jsx)
 * - Imported by both App.jsx and Tabs.jsx for data processing
 * - Exports: filterTransactions, processCSVFile, calculateMetrics, CHART_COLORS
 * - Handles all CSV parsing and data transformation logic
 * 
 * CURRENT FEATURES (v46.0 - ALL WORKING):
 * ✅ CSV Processing:
 *    - parseCSVLine() handles commas within quoted fields
 *    - parseDate() supports multiple date formats (ISO, MM/DD/YYYY)
 *    - Processes 40-column Sawyer export files
 *    - Deduplication using Order ID tracking
 *    - Filters out failed payments (only "Succeeded" status)
 *    - Validates positive net amounts
 * 
 * ✅ Data Categorization:
 *    - categorizeProgram() maps to 6 categories: Parties, Semester, Camps, Workshops, Private, Other
 *    - normalizeLocation() standardizes location names: Mamaroneck, NYC, Chappaqua, Partner, Other
 *    - Handles compound item types (e.g., "discount, semester")
 * 
 * ✅ Filtering System:
 *    - filterTransactions() applies date, location, and program filters
 *    - Supports custom date ranges with start/end dates
 *    - Handles relative date ranges (7d, 30d, 90d, 6m, 12m, ytd)
 * 
 * ✅ Metrics Calculation:
 *    - calculateMetrics() generates all dashboard metrics
 *    - Calculates revenue, customer counts, averages
 *    - Groups data by program, location, and month
 *    - Computes customer retention percentages
 * 
 * CHANGELOG v46.0:
 * - Fixed Program Distribution categories to 6 simplified categories:
 *   - Parties: Item Types = 'party'
 *   - Semester: Item Types = 'semester' (including compound types)
 *   - Camps: Activity Name includes 'summer' (highest priority)
 *   - Workshops: ALL drop-in sessions OR camps without 'summer'
 *   - Private: Item Types = 'pack'
 *   - Other: free trials, gift cards, weekly (non-summer), and unmatched items
 * 
 * CSV COLUMN MAPPING:
 * Required columns (must exist):
 * - Order ID, Order Date, Customer Email, Net Amount to Provider, Payment Status
 * Optional columns (used if present):
 * - Item Types, Order Activity Names, Order Locations, Provider Name
 * 
 * DATA FLOW:
 * 1. CSV file → processCSVFile() → transactions array
 * 2. transactions → filterTransactions() → filtered transactions
 * 3. filtered transactions → calculateMetrics() → dashboard metrics
 * 4. Metrics displayed in various tabs via DashboardTabs component
 */

// Parse CSV line handling commas within quoted fields
// Correctly handles fields like "Mamaroneck, NY" in quotes
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
  
  // Don't forget the last field
  if (current) {
    result.push(current.trim());
  }
  
  return result;
};

// Parse date strings into Date objects
// Handles multiple formats: ISO 8601, MM/DD/YYYY, MM-DD-YYYY
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Try standard Date parsing first (handles ISO format)
  const date = new Date(dateStr);
  if (!isNaN(date)) return date;
  
  // Try MM/DD/YYYY or MM-DD-YYYY format
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const [month, day, year] = parts;
    const parsedDate = new Date(year, month - 1, day);
    if (!isNaN(parsedDate)) return parsedDate;
  }
  
  return new Date(); // Return current date as fallback
};

// Normalize location names for consistent grouping
// Maps various location strings to standardized names
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
// Updated v46.0: Fixed categories per business requirements
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
  
  // 3. Semester - Item Types includes 'semester'
  if (itemTypeParts.some(part => part.includes('semester'))) {
    return 'Semester';
  }
  
  // 4. Workshops - ALL drop-in sessions OR non-summer camps
  if (type.includes('drop-in') || type.includes('drop in') || 
      type.includes('dropin') || type.includes('single')) {
    return 'Workshops';
  }
  
  // Also categorize non-summer camps as Workshops
  if (type.includes('camp') && !activity.includes('summer')) {
    return 'Workshops';
  }
  
  // 5. Private - Item Types includes 'pack'
  if (type.includes('pack')) {
    return 'Private';
  }
  
  // 6. Other - Everything else (free trials, gift cards, weekly non-summer, unmatched)
  return 'Other';
};

// Filter transactions based on date range, location, and program type
// Used by App.jsx to apply user-selected filters
const filterTransactions = (transactions, filters) => {
  if (!transactions || transactions.length === 0) return [];
  
  return transactions.filter(t => {
    // Date range filtering
    if (filters.dateRange && filters.dateRange !== 'all') {
      const transactionDate = new Date(t.orderDate);
      
      // Handle custom date range with specific start/end dates
      if (filters.dateRange === 'custom') {
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (transactionDate < startDate) return false;
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // Include entire end date
          if (transactionDate > endDate) return false;
        }
      } else {
        // Handle relative date ranges (7d, 30d, etc.)
        const now = new Date();
        const cutoffDate = new Date();
        
        // Calculate days back based on date range
        let daysBack = 0;
        switch(filters.dateRange) {
          case '7d': daysBack = 7; break;
          case '30d': daysBack = 30; break;
          case '90d': daysBack = 90; break;
          case '6m': daysBack = 180; break;
          case '12m': daysBack = 365; break;
          case 'ytd':
            cutoffDate.setMonth(0, 1); // January 1st of current year
            cutoffDate.setHours(0, 0, 0, 0);
            if (transactionDate < cutoffDate) return false;
            break;
        }
        
        if (daysBack > 0) {
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

// Chart colors for consistent visualization styling
// Used by Tabs.jsx for pie charts and other visualizations
const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
];

// Process CSV file and extract transaction data
// Main entry point for file upload functionality
const processCSVFile = async (file) => {
  try {
    // Read file content as text
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    
    // Split into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file appears to be empty or invalid');
    
    // Parse headers from first line
    const headers = parseCSVLine(lines[0]);
    console.log('📊 CSV Headers detected:', headers.length, 'columns');
    
    // Map column names to indices for required fields
    const requiredColumns = {
      'Order ID': headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('id')),
      'Order Date': headers.findIndex(h => h.toLowerCase().includes('order') && h.toLowerCase().includes('date')),
      'Customer Email': headers.findIndex(h => h.toLowerCase().includes('customer') && h.toLowerCase().includes('email')),
      'Net Amount to Provider': headers.findIndex(h => h.toLowerCase().includes('net') && h.toLowerCase().includes('amount')),
      'Payment Status': headers.findIndex(h => h.toLowerCase().includes('payment') && h.toLowerCase().includes('status'))
    };
    
    // Map column names to indices for optional fields
    const optionalColumns = {
      'Item Types': headers.findIndex(h => h.toLowerCase().includes('item') && h.toLowerCase().includes('type')),
      'Order Activity Names': headers.findIndex(h => h.toLowerCase().includes('activity')),
      'Order Locations': headers.findIndex(h => h.toLowerCase().includes('location')),
      'Provider Name': headers.findIndex(h => h.toLowerCase().includes('provider') && h.toLowerCase().includes('name'))
    };
    
    // Validate required columns exist
    for (const [name, index] of Object.entries(requiredColumns)) {
      if (index === -1) {
        throw new Error(`Required column "${name}" not found in CSV`);
      }
    }
    
    // Process data rows
    const transactions = [];
    const seenOrderIds = new Map(); // Track Order IDs for deduplication
    let processedCount = 0;
    let filteredCount = 0;
    let duplicateCount = 0;
    let failedPaymentCount = 0;
    let negativeAmountCount = 0;
    let totalCsvAmount = 0;
    
    // Debug logging for first few rows
    const debugFirstRows = 3;
    
    // Process each data row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      try {
        const values = parseCSVLine(line);
        
        // Handle case where data row has fewer columns than header
        // This can happen with trailing commas in the header
        while (values.length < headers.length) {
          values.push('');
        }
        
        // Extract required fields
        const orderId = values[requiredColumns['Order ID']]?.toString().trim();
        const orderDate = values[requiredColumns['Order Date']]?.toString().trim();
        const customerEmail = values[requiredColumns['Customer Email']]?.toString().trim();
        const netAmountStr = values[requiredColumns['Net Amount to Provider']]?.toString().trim();
        const paymentStatus = values[requiredColumns['Payment Status']]?.toString().trim();
        
        // Parse net amount, handling currency symbols and commas
        const netAmount = parseFloat(netAmountStr.replace(/[$,]/g, '')) || 0;
        
        // Extract optional fields
        const itemTypes = optionalColumns['Item Types'] >= 0
          ? values[optionalColumns['Item Types']]?.toString().trim() || ''
          : '';
        const activityName = optionalColumns['Order Activity Names'] >= 0
          ? values[optionalColumns['Order Activity Names']]?.toString().trim() || ''
          : '';
        const location = optionalColumns['Order Locations'] >= 0
          ? values[optionalColumns['Order Locations']]?.toString().trim() || ''
          : '';
        const providerName = optionalColumns['Provider Name'] >= 0
          ? values[optionalColumns['Provider Name']]?.toString().trim() || ''
          : '';
        
        // Skip invalid rows (missing required fields)
        if (!orderId || !customerEmail) {
          filteredCount++;
          if (i <= debugFirstRows) console.log(`  SKIPPED: Missing ${!orderId ? 'Order ID' : 'Email'}`);
          continue;
        }
        
        // Track all amounts for debugging
        if (paymentStatus === 'Succeeded') {
          totalCsvAmount += netAmount;
        }
        
        // Check for duplicates using Order ID
        if (seenOrderIds.has(orderId)) {
          duplicateCount++;
          if (i <= debugFirstRows) console.log(`  SKIPPED: Duplicate Order ID`);
          continue;
        }
        
        // Skip failed payments
        if (paymentStatus !== 'Succeeded') {
          failedPaymentCount++;
          if (i <= debugFirstRows) console.log(`  SKIPPED: Payment status is "${paymentStatus}" not "Succeeded"`);
          continue;
        }
        
        // Skip negative or zero amounts
        if (netAmount <= 0) {
          negativeAmountCount++;
          if (i <= debugFirstRows) console.log(`  SKIPPED: Net amount is ${netAmount} (must be > 0)`);
          continue;
        }
        
        // Mark Order ID as seen
        seenOrderIds.set(orderId, true);
        
        // Normalize location and categorize program
        const normalizedLocation = normalizeLocation(location);
        const programCategory = categorizeProgram(itemTypes, activityName);
        
        // Create transaction object
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
        if (i <= debugFirstRows) console.log(`  ✓ ADDED: Category = ${programCategory}`);
        
      } catch (rowError) {
        console.warn(`⚠️ Error processing row ${i + 1}:`, rowError.message);
      }
    }
    
    // Calculate summary statistics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.netAmount, 0);
    const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
    
    // Log processing summary
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

// Calculate dashboard metrics from transaction data
// Generates all metrics displayed in Overview and Analytics tabs
const calculateMetrics = (transactions) => {
  // Return empty metrics if no transactions
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
  
  // Calculate overview metrics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.netAmount || 0), 0);
  const uniqueCustomers = new Set(transactions.map(t => t.customerEmail)).size;
  const averageOrderValue = totalRevenue / transactions.length;
  
  // Group transactions by program category
  const programMap = {};
  transactions.forEach(t => {
    if (!programMap[t.programCategory]) {
      programMap[t.programCategory] = { revenue: 0, count: 0, customers: new Set() };
    }
    programMap[t.programCategory].revenue += t.netAmount || 0;
    programMap[t.programCategory].count++;
    programMap[t.programCategory].customers.add(t.customerEmail);
  });
  
  // Convert program map to array for charts
  // Note: category names are used as-is, no display name mapping
  const programData = Object.entries(programMap).map(([name, data]) => ({
    name: name, // Use the category name as-is
    revenue: Math.round(data.revenue),
    count: data.count,
    uniqueCustomers: data.customers.size,
    avgTransaction: Math.round(data.revenue / data.count)
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Group transactions by location
  const locationMap = {};
  transactions.forEach(t => {
    if (!locationMap[t.location]) {
      locationMap[t.location] = { revenue: 0, count: 0 };
    }
    locationMap[t.location].revenue += t.netAmount || 0;
    locationMap[t.location].count++;
  });
  
  // Convert location map to array for charts
  const locationData = Object.entries(locationMap).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    count: data.count
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Group transactions by month
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = new Date(t.orderDate).toISOString().slice(0, 7); // YYYY-MM format
    if (!monthlyMap[month]) {
      monthlyMap[month] = { revenue: 0, count: 0 };
    }
    monthlyMap[month].revenue += t.netAmount || 0;
    monthlyMap[month].count++;
  });
  
  // Convert monthly map to sorted array
  const monthlyRevenue = Object.entries(monthlyMap)
    .map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      transactions: data.count
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate customer retention metrics
  const customerPurchases = {};
  transactions.forEach(t => {
    if (!customerPurchases[t.customerEmail]) {
      customerPurchases[t.customerEmail] = 0;
    }
    customerPurchases[t.customerEmail]++;
  });
  
  // Count customers with multiple purchases
  const repeatCustomers = Object.values(customerPurchases).filter(count => count > 1).length;
  const customerRetention = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
  
  // Return complete metrics object
  return {
    overview: {
      totalRevenue: Math.round(totalRevenue),
      uniqueCustomers,
      totalTransactions: transactions.length,
      averageOrderValue: Math.round(averageOrderValue),
      conversionRate: 0, // Would need additional data (visits vs purchases) to calculate
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
