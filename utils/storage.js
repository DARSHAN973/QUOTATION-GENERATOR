// Local storage utilities for settings and data persistence

const STORAGE_KEYS = {
  SETTINGS: 'calculation_crm_settings',
  PRICE_LIST: 'calculation_crm_price_list',
  QUOTATION_DATA: 'calculation_crm_quotation_data',
  LAST_QUOTATION_NUMBER: 'calculation_crm_last_quotation_number'
};

// Save data to localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Load data from localStorage
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Remove data from localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Clear all app data from localStorage
export const clearAllAppData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
};

// Settings specific functions
export const saveSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = (defaultSettings) => {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
};

// Price list specific functions
export const savePriceList = (priceList) => {
  return saveToStorage(STORAGE_KEYS.PRICE_LIST, priceList);
};

export const loadPriceList = (defaultPriceList) => {
  return loadFromStorage(STORAGE_KEYS.PRICE_LIST, defaultPriceList);
};

// Quotation data specific functions
export const saveQuotationData = (quotationData) => {
  return saveToStorage(STORAGE_KEYS.QUOTATION_DATA, quotationData);
};

export const loadQuotationData = () => {
  return loadFromStorage(STORAGE_KEYS.QUOTATION_DATA, null);
};

export const clearQuotationData = () => {
  return removeFromStorage(STORAGE_KEYS.QUOTATION_DATA);
};

// Quotation number tracking
export const getNextQuotationNumber = () => {
  const lastNumber = loadFromStorage(STORAGE_KEYS.LAST_QUOTATION_NUMBER, 0);
  const nextNumber = lastNumber + 1;
  saveToStorage(STORAGE_KEYS.LAST_QUOTATION_NUMBER, nextNumber);
  return nextNumber;
};

// Export/Import functionality for backup/restore
export const exportAllData = () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = loadFromStorage(key);
  });
  return data;
};

export const importAllData = (data) => {
  try {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name] !== undefined) {
        saveToStorage(key, data[name]);
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};