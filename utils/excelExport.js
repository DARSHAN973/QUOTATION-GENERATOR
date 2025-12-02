// Excel export utilities for quotations

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SUPPLY_TYPES, RATE_BASIS } from '../data/constants.js';
import { generateDescription } from './descriptions.js';

// Create Excel workbook for quotation
export const createQuotationExcel = (quotationData, settings) => {
  const { orderSettings, lineItems, totals } = quotationData;
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for the main quotation sheet
  const quotationSheet = createQuotationSheet(quotationData, settings);
  
  // Add the quotation sheet to workbook
  XLSX.utils.book_append_sheet(workbook, quotationSheet, 'Quotation');
  
  return workbook;
};

// Create the main quotation sheet
const createQuotationSheet = (quotationData, settings) => {
  const { orderSettings, lineItems, totals } = quotationData;
  
  // Prepare the data array for Excel
  const data = [];
  
  // Header section
  data.push(['QUOTATION']);
  data.push([]);
  
  // Intro text
  data.push(['Respected Sir,']);
  data.push(['Thank you very much for your valued inquiry.']);
  data.push(['We are pleased to quote our best rates as under:']);
  data.push([]);
  
  // Table headers
  data.push([
    'SR. NO',
    'ITEM DESCRIPTION',
    'QTY',
    'UNIT',
    'WEIGHT',
    'RATE PER KGS',
    'RATE PER MTRS',
    'AMOUNT'
  ]);
  
  // Process line items
  let srNo = 1;
  lineItems.forEach((item) => {
    // Generate description
    const description = generateDescription(item.material, item.sizes, {
      pipeClass: item.pipeClass,
      schedule: item.schedule,
      make: item.make,
      thickness: item.thickness
    });
    
    // Add header description
    data.push([
      srNo,
      description.header,
      '', '', '', '', '', ''
    ]);
    
    // Add sub-lines for each size
    description.subLines.forEach((subLine) => {
      const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
      const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
      const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : item.finalRate / item.wtPerMtr;
      const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : item.finalRate * item.wtPerMtr;
      
      data.push([
        '',
        subLine,
        qty.toFixed(2),
        unit,
        item.totalKg.toFixed(2),
        ratePerKg.toFixed(2),
        ratePerMtr.toFixed(2),
        item.lineAmount.toFixed(2)
      ]);
    });
    
    srNo++;
  });
  
  // Add totals row
  const totalQty = lineItems.reduce((sum, item) => 
    sum + (item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg), 0
  );
  
  data.push([
    '',
    'TOTAL',
    totalQty.toFixed(2),
    '',
    totals.totalWeight.toFixed(2),
    '',
    '',
    totals.netAmount.toFixed(2)
  ]);
  
  data.push([]);
  data.push(['', '', '', '', '', '', 'NET AMOUNT:', totals.netAmount.toFixed(2)]);
  data.push(['', '', '', '', '', '', `GST ${orderSettings.gst}%:`, totals.gstAmount.toFixed(2)]);
  data.push(['', '', '', '', '', '', 'TOTAL AMOUNT:', totals.totalAmount.toFixed(2)]);
  
  data.push([]);
  
  // Terms and conditions
  const terms = getTermsAndConditions(orderSettings);
  terms.forEach(term => {
    data.push([term]);
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [
    { wch: 8 },   // SR. NO
    { wch: 50 },  // ITEM DESCRIPTION
    { wch: 12 },  // QTY
    { wch: 8 },   // UNIT
    { wch: 12 },  // WEIGHT
    { wch: 15 },  // RATE PER KGS
    { wch: 15 },  // RATE PER MTRS
    { wch: 15 }   // AMOUNT
  ];
  worksheet['!cols'] = colWidths;
  
  // Apply some basic formatting
  applyExcelFormatting(worksheet, data.length);
  
  return worksheet;
};

// Get terms and conditions based on supply type
const getTermsAndConditions = (orderSettings) => {
  const terms = [];
  const currentDate = new Date();
  const validTillDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  if (orderSettings.supplyType === SUPPLY_TYPES.GODOWN) {
    terms.push('TERMS & CONDITIONS:');
    terms.push('1. Payment term: [To be specified]');
    terms.push(`2. +${orderSettings.gst}% GST EXTRA`);
    terms.push('3. TRANSPORT EXTRA AT ACTUAL.');
    terms.push('4. LOADING EXTRA');
    terms.push('5. UNLOADING EXTRA IN YOUR ACCOUNT');
    terms.push('6. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID');
    terms.push(`7. RATES VALID TILL ${format(validTillDate, 'dd-MM-yyyy')}`);
    terms.push(`8. PIPES RATES EX- ${orderSettings.godown.toUpperCase()} GODOWN`);
  } else {
    terms.push('TERMS & CONDITIONS:');
    terms.push('1. Delivery: [Address to be specified]');
    terms.push('2. Payment against proforma – 100% advance');
    terms.push('3. Free delivery from Jindal in 20 ton multiples');
    terms.push('4. Dead freight for part loads will be charged extra');
    terms.push('5. Material will be dispatched from Wagholi godown');
    terms.push('6. Unloading extra in your A/c');
    terms.push('7. Delivery within one week from receipt of order and payment');
    terms.push('8. Late payment charges @ 18% per annum');
    terms.push('9. In case of increase in steel prices, above rates will not be valid');
    terms.push(`10. RATES VALID TILL ${format(validTillDate, 'dd-MM-yyyy')}`);
  }
  
  return terms;
};

// Apply basic formatting to Excel sheet
const applyExcelFormatting = (worksheet, totalRows) => {
  // This is a simplified formatting function
  // In a real implementation, you might want to use xlsx-style or similar
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Set some basic styles (note: basic XLSX doesn't support full styling)
  // For full styling, you would need xlsx-style or similar packages
  
  return worksheet;
};

// Export quotation as Excel file
export const exportQuotationAsExcel = (quotationData, settings, filename) => {
  try {
    const workbook = createQuotationExcel(quotationData, settings);
    
    // Generate filename if not provided
    if (!filename) {
      const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      filename = `quotation_${currentDate}.xlsx`;
    }
    
    // Write and download the file
    XLSX.writeFile(workbook, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return { success: false, error: error.message };
  }
};

// Create a summary sheet with calculation details
export const createCalculationSummary = (quotationData) => {
  const { orderSettings, lineItems, totals, bulkCalculation } = quotationData;
  
  const data = [];
  
  data.push(['CALCULATION SUMMARY']);
  data.push([]);
  
  data.push(['ORDER SETTINGS:']);
  data.push(['Supply Type:', orderSettings.supplyType]);
  data.push(['Godown:', orderSettings.godown || 'N/A']);
  data.push(['Plant:', orderSettings.plant]);
  data.push(['GST %:', orderSettings.gst]);
  data.push([]);
  
  data.push(['LINE ITEMS SUMMARY:']);
  data.push(['Total Items:', lineItems.length]);
  data.push(['Total Quantity:', totals.totalQty.toFixed(2)]);
  data.push(['Total Weight (Kg):', totals.totalWeight.toFixed(2)]);
  data.push(['Net Amount:', totals.netAmount.toFixed(2)]);
  data.push(['GST Amount:', totals.gstAmount.toFixed(2)]);
  data.push(['Total Amount:', totals.totalAmount.toFixed(2)]);
  data.push([]);
  
  if (orderSettings.supplyType === SUPPLY_TYPES.DIRECT) {
    data.push(['BULK CALCULATION:']);
    data.push(['Vehicle Capacity:', bulkCalculation.vehicleCapacity, 'Tons']);
    data.push(['Dead Freight Rate:', bulkCalculation.deadFreightRate, 'per Ton']);
    data.push(['Base Rate:', bulkCalculation.baseRate, 'per Mtr']);
    data.push(['Profit %:', bulkCalculation.profitPercentage]);
    data.push([]);
  }
  
  data.push(['ITEM DETAILS:']);
  data.push(['Material', 'Size', 'Qty', 'Unit', 'Rate', 'Amount']);
  
  lineItems.forEach((item, index) => {
    const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
    const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'Mtrs' : 'Kgs';
    
    data.push([
      item.material,
      item.sizes.join(', ') + ' NB',
      qty.toFixed(2),
      unit,
      item.finalRate.toFixed(2),
      item.lineAmount.toFixed(2)
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  return worksheet;
};

// Export with multiple sheets
export const exportDetailedQuotation = (quotationData, settings, filename) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Add main quotation sheet
    const quotationSheet = createQuotationSheet(quotationData, settings);
    XLSX.utils.book_append_sheet(workbook, quotationSheet, 'Quotation');
    
    // Add calculation summary sheet
    const summarySheet = createCalculationSummary(quotationData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Calculation Summary');
    
    // Generate filename if not provided
    if (!filename) {
      const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      filename = `detailed_quotation_${currentDate}.xlsx`;
    }
    
    // Write and download the file
    XLSX.writeFile(workbook, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting detailed Excel:', error);
    return { success: false, error: error.message };
  }
};