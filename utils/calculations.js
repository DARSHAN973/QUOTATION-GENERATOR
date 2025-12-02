// Calculation utilities for the CRM

// Calculate total meters from pipes count
export const calculateMetersFromPipes = (pipeCount, pipeLength = 6) => {
  return pipeCount * pipeLength;
};

// Calculate total kg from meters and weight per meter
export const calculateKgFromMeters = (meters, wtPerMtr) => {
  return meters * wtPerMtr;
};

// Calculate meters from kg and weight per meter
export const calculateMetersFromKg = (kg, wtPerMtr) => {
  if (wtPerMtr === 0) return 0;
  return kg / wtPerMtr;
};

// Calculate rate per kg from rate per meter
export const calculateRatePerKg = (ratePerMtr, wtPerMtr) => {
  if (wtPerMtr === 0) return 0;
  return ratePerMtr / wtPerMtr;
};

// Calculate rate per meter from rate per kg
export const calculateRatePerMtr = (ratePerKg, wtPerMtr) => {
  return ratePerKg * wtPerMtr;
};

// Apply discount to rate
export const applyDiscount = (rate, discountPercent) => {
  return rate * (1 - discountPercent / 100);
};

// Calculate line amount
export const calculateLineAmount = (quantity, rate) => {
  return quantity * rate;
};

// Calculate GST amount
export const calculateGST = (amount, gstPercent) => {
  return amount * (gstPercent / 100);
};

// Calculate total amount with GST
export const calculateTotalWithGST = (amount, gstPercent) => {
  return amount + calculateGST(amount, gstPercent);
};

// Bulk calculation for direct Jindal supply
export const calculateBulkRates = (orderTon, vehicleCapacity, deadFreightRate, baseRate, profitPercent, totalMeters) => {
  const vehiclesNeeded = Math.ceil(orderTon / vehicleCapacity);
  const totalCapacity = vehiclesNeeded * vehicleCapacity;
  const deadTon = Math.max(0, totalCapacity - orderTon);
  const deadFreightTotal = deadTon * deadFreightRate;
  const baseRateWithProfit = baseRate * (1 + profitPercent / 100);
  const deadFreightPerMtr = totalMeters > 0 ? deadFreightTotal / totalMeters : 0;
  
  return {
    vehiclesNeeded,
    totalCapacity,
    deadTon,
    deadFreightTotal,
    baseRateWithProfit,
    deadFreightPerMtr,
    finalBulkRate: baseRateWithProfit + deadFreightPerMtr
  };
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Round to specified decimal places
export const roundTo = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Check if rate is below cost (safety check)
export const isBelowCost = (finalRate, costRate) => {
  return finalRate < costRate;
};