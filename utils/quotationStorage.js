// Quotation Storage Utility
// Handles saving and retrieving quotations from local storage

const QUOTATIONS_STORAGE_KEY = 'crm_quotations';
const QUOTATION_COUNTER_KEY = 'crm_quotation_counter';

// Generate unique quotation ID
export const generateQuotationId = () => {
  const counter = parseInt(localStorage.getItem(QUOTATION_COUNTER_KEY) || '0') + 1;
  localStorage.setItem(QUOTATION_COUNTER_KEY, counter.toString());
  
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  return `QTN-${dateStr}-${counter.toString().padStart(3, '0')}`;
};

// Save quotation to local storage
export const saveQuotation = (quotationData) => {
  try {
    const quotations = getQuotations();
    
    // Create quotation object with metadata
    const quotation = {
      id: quotationData.id || generateQuotationId(),
      createdAt: quotationData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: quotationData.status || 'draft',
      orderSettings: quotationData.orderSettings || {},
      lineItems: quotationData.lineItems || [],
      totals: quotationData.totals || {},
      termsAndConditions: quotationData.termsAndConditions || {},
      bulkCalculation: quotationData.bulkCalculation || {},
      // Add metadata
      version: '1.0',
      source: 'web-app'
    };
    
    // Check if quotation already exists (update) or is new
    const existingIndex = quotations.findIndex(q => q.id === quotation.id);
    
    if (existingIndex >= 0) {
      quotations[existingIndex] = { 
        ...quotations[existingIndex], 
        ...quotation, 
        updatedAt: new Date().toISOString() 
      };
    } else {
      quotations.push(quotation);
    }
    
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
    
    return {
      success: true,
      quotationId: quotation.id,
      quotation: quotation
    };
  } catch (error) {
    console.error('Error saving quotation:', error);
    return {
      success: false,
      error: 'Failed to save quotation'
    };
  }
};

// Get all quotations from local storage
export const getQuotations = () => {
  try {
    const quotations = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    return quotations ? JSON.parse(quotations) : [];
  } catch (error) {
    console.error('Error retrieving quotations:', error);
    return [];
  }
};

// Get a specific quotation by ID
export const getQuotationById = (id) => {
  const quotations = getQuotations();
  return quotations.find(q => q.id === id) || null;
};

// Delete a quotation
export const deleteQuotation = (id) => {
  try {
    const quotations = getQuotations();
    const filteredQuotations = quotations.filter(q => q.id !== id);
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(filteredQuotations));
    return true;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return false;
  }
};

// Update quotation status
export const updateQuotationStatus = (id, status) => {
  try {
    const quotations = getQuotations();
    const quotationIndex = quotations.findIndex(q => q.id === id);
    
    if (quotationIndex >= 0) {
      quotations[quotationIndex].status = status;
      quotations[quotationIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return false;
  }
};

// Export quotations data as JSON (for backup/download)
export const exportQuotationsData = () => {
  const quotations = getQuotations();
  const data = {
    exportDate: new Date().toISOString(),
    totalQuotations: quotations.length,
    quotations
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `quotations-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import quotations data from JSON file
export const importQuotationsData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (importData.quotations && Array.isArray(importData.quotations)) {
          const existingQuotations = getQuotations();
          const mergedQuotations = [...existingQuotations];
          
          // Merge imported quotations (avoid duplicates by ID)
          importData.quotations.forEach(importedQuotation => {
            const existingIndex = mergedQuotations.findIndex(q => q.id === importedQuotation.id);
            if (existingIndex >= 0) {
              // Update existing quotation
              mergedQuotations[existingIndex] = importedQuotation;
            } else {
              // Add new quotation
              mergedQuotations.push(importedQuotation);
            }
          });
          
          localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(mergedQuotations));
          resolve(importData.quotations.length);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(new Error('Failed to parse file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Get quotation statistics
export const getQuotationStats = () => {
  const quotations = getQuotations();
  
  const stats = {
    total: quotations.length,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    totalValue: 0,
    thisMonth: 0,
    thisYear: 0
  };
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  quotations.forEach(quotation => {
    // Count by status
    stats[quotation.status] = (stats[quotation.status] || 0) + 1;
    
    // Calculate total value
    if (quotation.totals?.totalAmount) {
      stats.totalValue += quotation.totals.totalAmount;
    }
    
    // Count this month/year
    const quotationDate = new Date(quotation.createdAt);
    if (quotationDate.getFullYear() === currentYear) {
      stats.thisYear++;
      if (quotationDate.getMonth() === currentMonth) {
        stats.thisMonth++;
      }
    }
  });
  
  return stats;
};

// Search quotations
export const searchQuotations = (query) => {
  const quotations = getQuotations();
  const searchTerm = query.toLowerCase();
  
  return quotations.filter(quotation => 
    quotation.id.toLowerCase().includes(searchTerm) ||
    quotation.orderSettings?.customerName?.toLowerCase().includes(searchTerm) ||
    quotation.lineItems?.some(item => 
      item.material.toLowerCase().includes(searchTerm) ||
      item.sizes?.some(size => size.toString().includes(searchTerm))
    )
  );
};