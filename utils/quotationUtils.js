// Quotation utility functions

import { format } from 'date-fns';

// Generate auto SR NO in format: DEC001, JAN002, etc.
export const generateSRNumber = (existingQuotations = []) => {
  const currentDate = new Date();
  const monthAbbr = format(currentDate, 'MMM').toUpperCase();
  
  // Find highest number for current month
  const currentMonthQuotations = existingQuotations.filter(q => 
    q.srNo && q.srNo.startsWith(monthAbbr)
  );
  
  let maxNumber = 0;
  currentMonthQuotations.forEach(q => {
    const numberPart = q.srNo.slice(3); // Remove month part (DEC)
    const num = parseInt(numberPart, 10);
    if (!isNaN(num) && num > maxNumber) {
      maxNumber = num;
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${monthAbbr}${nextNumber.toString().padStart(3, '0')}`;
};

// Validate SR NO format (XXX001)
export const validateSRNumber = (srNo) => {
  if (!srNo) return false;
  
  const regex = /^[A-Z]{3}\d{3}$/;
  return regex.test(srNo);
};

// Format quotation date for display
export const formatQuotationDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd-MM-yyyy');
};

// Parse date from DD-MM-YYYY format
export const parseDateFromString = (dateString) => {
  if (!dateString) return new Date();
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date();
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  return new Date(year, month, day);
};

// Get current date in DD-MM-YYYY format
export const getCurrentDateFormatted = () => {
  return format(new Date(), 'dd-MM-yyyy');
};

// Generate unique quotation ID
export const generateQuotationId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `QTN_${timestamp}_${random}`;
};

// Quotation status constants
export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONVERTED: 'converted'
};

// Get status display text
export const getStatusDisplayText = (status) => {
  const statusMap = {
    [QUOTATION_STATUS.DRAFT]: 'Draft',
    [QUOTATION_STATUS.SENT]: 'Sent',
    [QUOTATION_STATUS.APPROVED]: 'Approved',
    [QUOTATION_STATUS.REJECTED]: 'Rejected',
    [QUOTATION_STATUS.CONVERTED]: 'Converted to Order'
  };
  
  return statusMap[status] || 'Unknown';
};

// Get status color for UI
export const getStatusColor = (status) => {
  const colorMap = {
    [QUOTATION_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [QUOTATION_STATUS.SENT]: 'bg-blue-100 text-blue-800',
    [QUOTATION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [QUOTATION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [QUOTATION_STATUS.CONVERTED]: 'bg-purple-100 text-purple-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};