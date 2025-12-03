// Excel export utilities for quotations

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SUPPLY_TYPES, RATE_BASIS } from '../data/constants.js';
import { generateDescription } from './descriptions.js';

// Create Excel workbook for quotation
export const createQuotationExcel = (quotationData, settings, options = {}) => {
  const { orderSettings, lineItems, totals } = quotationData;
  const { columnVisibility = {}, editableDescriptions = {} } = options;
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for the main quotation sheet
  const quotationSheet = createQuotationSheet(quotationData, settings, options);
  
  // Add the quotation sheet to workbook
  XLSX.utils.book_append_sheet(workbook, quotationSheet, 'Quotation');
  
  return workbook;
};

// Create the main quotation sheet
const createQuotationSheet = (quotationData, settings, options = {}) => {
  const { orderSettings, lineItems, totals, termsAndConditions = {} } = quotationData;
  const { columnVisibility = {}, editableDescriptions = {} } = options;
  
  // Default column visibility if not provided
  const defaultVisibility = {
    srNo: true,
    description: true,
    qty: true,
    unit: true,
    weight: true,
    ratePerKg: true,
    ratePerMtr: true,
    amount: true
  };
  
  const visibility = { ...defaultVisibility, ...columnVisibility };
  
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
  
  // Table headers - only include visible columns
  const headers = [];
  if (visibility.srNo) headers.push('SR. NO');
  if (visibility.description) headers.push('ITEM DESCRIPTION');
  if (visibility.qty) headers.push('QTY');
  if (visibility.unit) headers.push('UNIT');
  if (visibility.weight) headers.push('WEIGHT');
  if (visibility.ratePerKg) headers.push('RATE PER KGS');
  if (visibility.ratePerMtr) headers.push('RATE PER MTRS');
  if (visibility.amount) headers.push('AMOUNT');
  
  data.push(headers);
  
  // Process line items
  let srNo = 1;
  lineItems.forEach((item) => {
    // Use editable description if available, otherwise generate
    let descriptions;
    if (editableDescriptions[item.id]) {
      const lines = editableDescriptions[item.id].split('\n');
      descriptions = {
        header: lines[0] || '',
        subLines: lines.slice(1).filter(line => line.trim())
      };
    } else {
      descriptions = generateDescription(item.material, item.sizes, {
        pipeClass: item.pipeClass,
        schedule: item.schedule,
        make: item.make,
        thickness: item.thickness
      });
    }
    
    // Add header description row
    const headerRow = [];
    if (visibility.srNo) headerRow.push(String.fromCharCode(64 + srNo) + '.');
    if (visibility.description) headerRow.push(descriptions.header);
    if (visibility.qty) headerRow.push('');
    if (visibility.unit) headerRow.push('');
    if (visibility.weight) headerRow.push('');
    if (visibility.ratePerKg) headerRow.push('');
    if (visibility.ratePerMtr) headerRow.push('');
    if (visibility.amount) headerRow.push('');
    data.push(headerRow);
    
    // Add sub-lines for each size
    descriptions.subLines.forEach((subLine, subIndex) => {
      const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
      const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
      const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : item.finalRate / item.wtPerMtr;
      const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : item.finalRate * item.wtPerMtr;
      
      const subRow = [];
      if (visibility.srNo) subRow.push((subIndex + 1) + '.');
      if (visibility.description) subRow.push(subLine);
      if (visibility.qty) subRow.push(qty.toFixed(2));
      if (visibility.unit) subRow.push(unit);
      if (visibility.weight) subRow.push(item.totalKg.toFixed(2));
      if (visibility.ratePerKg) subRow.push(ratePerKg.toFixed(2));
      if (visibility.ratePerMtr) subRow.push(ratePerMtr.toFixed(2));
      if (visibility.amount) subRow.push(item.lineAmount.toFixed(2));
      data.push(subRow);
    });
    
    srNo++;
  });
  
  // Add totals row
  const totalQty = lineItems.reduce((sum, item) => 
    sum + (item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg), 0
  );
  
  const totalRow = [];
  if (visibility.srNo) totalRow.push('');
  if (visibility.description) totalRow.push('TOTAL');
  if (visibility.qty) totalRow.push(totalQty.toFixed(2));
  if (visibility.unit) totalRow.push('');
  if (visibility.weight) totalRow.push(totals.totalWeight.toFixed(2));
  if (visibility.ratePerKg) totalRow.push('');
  if (visibility.ratePerMtr) totalRow.push('');
  if (visibility.amount) totalRow.push(totals.netAmount.toFixed(2));
  data.push(totalRow);
  
  data.push([]);
  
  // Amount summary
  data.push(['', '', '', '', '', '', 'TOTAL AMOUNT:', totals.totalAmount.toFixed(2)]);
  
  data.push([]);
  
  // Terms and conditions
  const terms = getTermsAndConditions(orderSettings, termsAndConditions);
  terms.forEach(term => {
    data.push([term]);
  });
  
  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Add formatting and styling
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Set column widths
  const columnWidths = [];
  for (let col = 0; col <= range.e.c; col++) {
    columnWidths.push({ wch: 15 });
  }
  worksheet['!cols'] = columnWidths;
  
  // Apply borders and highlighting to all cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Add borders to all cells
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.border = {
        top: { style: 'thin', color: { auto: 1 } },
        bottom: { style: 'thin', color: { auto: 1 } },
        left: { style: 'thin', color: { auto: 1 } },
        right: { style: 'thin', color: { auto: 1 } }
      };
      
      // Highlight header rows (row 0-2: company info, quotation header, table headers)
      if (row <= 2) {
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s.fill = {
          fgColor: { rgb: 'E6F3FF' }
        };
        worksheet[cellAddress].s.font = {
          bold: true
        };
      }
      
      // Highlight total row and amount summary rows
      if (row >= range.e.r - 5) { // Last few rows typically contain totals
        const cellValue = worksheet[cellAddress].v;
        if (cellValue && (
          cellValue.toString().includes('TOTAL') || 
          cellValue.toString().includes('AMOUNT') ||
          cellValue.toString().includes('GST')
        )) {
          if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
          worksheet[cellAddress].s.fill = {
            fgColor: { rgb: 'FFFF99' }
          };
          worksheet[cellAddress].s.font = {
            bold: true
          };
        }
      }
    }
  }
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
const getTermsAndConditions = (orderSettings, termsAndConditions = {}) => {
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
export const exportQuotationAsExcel = (quotationData, settings, options = {}) => {
  try {
    const workbook = createQuotationExcel(quotationData, settings, options);
    
    // Generate filename if not provided
    let filename = options.filename;
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
export const exportDetailedQuotation = (quotationData, settings, options = {}) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Add main quotation sheet
    const quotationSheet = createQuotationSheet(quotationData, settings, options);
    XLSX.utils.book_append_sheet(workbook, quotationSheet, 'Quotation');
    
    // Add calculation summary sheet
    const summarySheet = createCalculationSummary(quotationData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Calculation Summary');
    
    // Generate filename if not provided
    let filename = options.filename;
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