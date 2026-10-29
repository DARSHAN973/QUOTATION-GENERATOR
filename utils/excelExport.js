// Excel export utilities for quotations with enhanced formatting

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { SUPPLY_TYPES, RATE_BASIS } from '../data/constants.js';
import { generateDescription } from './descriptions.js';

// Create Excel workbook for quotation
export const createQuotationExcel = (quotationData, settings, options = {}) => {
  const workbook = XLSX.utils.book_new();
  const quotationSheet = createQuotationSheet(quotationData, settings, options);
  XLSX.utils.book_append_sheet(workbook, quotationSheet, 'Quotation');
  return workbook;
};

// Create the main quotation sheet with enhanced formatting
const createQuotationSheet = (quotationData, settings, options = {}) => {
  const { orderSettings, lineItems, totals, termsAndConditions = {} } = quotationData;
  const { columnVisibility = {}, editableDescriptions = {} } = options;
  
  // Mandatory columns always visible
  const visibility = {
    srNo: true,
    description: true,
    qty: true,
    unit: true,
    weight: columnVisibility.weight !== false,
    ratePerKg: columnVisibility.ratePerKg !== false,
    ratePerMtr: columnVisibility.ratePerMtr !== false,
    amount: true
  };
  
  const data = [];
  
  // Company Header
  data.push(['PIPES & FLOW PRODUCTS', '', '', '', '', '', '', '']);
  data.push(['(An ISO 9001 : 2015 Certified Company)', '', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', '', '', '']);
  data.push(['Respected Sir/Madam,', '', '', '', '', '', '', '']);
  data.push(['Thank you very much for your valued inquiry.', '', '', '', '', '', '', '']);
  data.push(['We are pleased to quote our best rates as under:', '', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', '', '', '']);
  
  // Table headers
  const headers = [];
  if (visibility.srNo) headers.push('SR. NO');
  if (visibility.description) headers.push('ITEM DESCRIPTION');
  if (visibility.qty) headers.push('QTY');
  if (visibility.unit) headers.push('UNIT');
  if (visibility.weight) headers.push('WEIGHT');
  if (visibility.ratePerKg) headers.push('RATE/KG');
  if (visibility.ratePerMtr) headers.push('RATE/MTR');
  if (visibility.amount) headers.push('AMOUNT');
  
  while (headers.length < 8) headers.push('');
  data.push(headers);
  
  // Process line items
  let srNo = 1;
  lineItems.forEach((item) => {
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
    
    // Header row
    const headerRow = [];
    if (visibility.srNo) headerRow.push(String.fromCharCode(64 + srNo) + '.');
    if (visibility.description) headerRow.push(descriptions.header);
    if (visibility.qty) headerRow.push('');
    if (visibility.unit) headerRow.push('');
    if (visibility.weight) headerRow.push('');
    if (visibility.ratePerKg) headerRow.push('');
    if (visibility.ratePerMtr) headerRow.push('');
    if (visibility.amount) headerRow.push('');
    while (headerRow.length < 8) headerRow.push('');
    data.push(headerRow);
    
    // Sub-lines
    descriptions.subLines.forEach((subLine, subIndex) => {
      const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
      const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
      const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : (item.wtPerMtr > 0 ? item.finalRate / item.wtPerMtr : 0);
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
      while (subRow.length < 8) subRow.push('');
      data.push(subRow);
    });
    
    srNo++;
  });
  
  // Totals
  data.push(['', '', '', '', '', '', '', '']);
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
  while (totalRow.length < 8) totalRow.push('');
  data.push(totalRow);
  
  // Amount summary
  data.push(['', '', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', '', 'TOTAL AMOUNT:', `₹${totals.totalAmount.toFixed(2)}`]);
  data.push(['', '', '', '', '', '', '', '']);
  
  // Terms and conditions
  const terms = getTermsAndConditions(orderSettings, termsAndConditions);
  terms.forEach(term => {
    data.push([term, '', '', '', '', '', '', '']);
  });
  
  // Thank you message
  data.push(['', '', '', '', '', '', '', '']);
  data.push(['Thank you for your valued inquiry. We look forward to receiving your valuable order.', '', '', '', '', '', '', '']);
  data.push(['', '', '', '', '', '', '', '']);
  data.push(['With Best Regards,', '', '', '', '', '', '', '']);
  data.push(['Pipes & Flow Products', '', '', '', '', '', '', '']);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [
    { wch: 8 },   // SR. NO
    { wch: 45 },  // ITEM DESCRIPTION
    { wch: 12 },  // QTY
    { wch: 8 },   // UNIT
    { wch: 12 },  // WEIGHT
    { wch: 12 },  // RATE/KG
    { wch: 12 },  // RATE/MTR
    { wch: 15 }   // AMOUNT
  ];
  worksheet['!cols'] = colWidths;
  
  // Apply formatting
  applyEnhancedExcelFormatting(worksheet);
  
  return worksheet;
};

// Get terms and conditions
const getTermsAndConditions = (orderSettings, termsAndConditions = {}) => {
  const terms = [];
  const currentDate = new Date();
  const validTillDate = termsAndConditions.validTillDate 
    ? new Date(termsAndConditions.validTillDate)
    : new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  terms.push('TERMS & CONDITIONS:');
  
  if (orderSettings.supplyType === SUPPLY_TYPES.GODOWN) {
    terms.push(`1. Payment term: ${termsAndConditions.paymentTerm || 'Against Delivery'}`);
    terms.push(`2. +${orderSettings.gst || 18}% GST EXTRA`);
    if (termsAndConditions.showTransportExtra !== false) {
      terms.push('3. TRANSPORT EXTRA AT ACTUAL.');
    }
    if (termsAndConditions.showLoadingExtra !== false) {
      terms.push('4. LOADING EXTRA');
    }
    terms.push('5. UNLOADING EXTRA IN YOUR ACCOUNT');
    terms.push('6. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID');
    terms.push(`7. RATES VALID TILL ${format(validTillDate, 'dd/MM/yyyy')}`);
    if (termsAndConditions.showGodownLocation !== false) {
      terms.push(`8. PIPES RATES EX- ${orderSettings.godown?.toUpperCase() || 'WAGHOLI'} GODOWN`);
    }
  } else {
    terms.push('1. Delivery: [Address to be specified]');
    terms.push('2. Payment against proforma – 100% advance');
    terms.push('3. Free delivery from Jindal in 20 ton multiples');
    terms.push('4. Dead freight for part loads will be charged extra');
    terms.push('5. Material will be dispatched from Wagholi godown');
    terms.push('6. Unloading extra in your A/c');
    terms.push('7. Delivery within one week from receipt of order and payment');
    terms.push('8. Late payment charges @ 18% per annum');
    terms.push('9. In case of increase in steel prices, above rates will not be valid');
    terms.push(`10. RATES VALID TILL ${format(validTillDate, 'dd/MM/yyyy')}`);
  }
  
  return terms;
};

// Apply enhanced formatting with borders
const applyEnhancedExcelFormatting = (worksheet) => {
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { t: 's', v: '' };
      }
      
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {};
      }
      
      // Apply borders to all cells
      worksheet[cellAddress].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
      
      const cellValue = worksheet[cellAddress].v;
      
      // Company header styling
      if (row <= 2) {
        worksheet[cellAddress].s.font = {
          bold: true,
          size: row === 0 ? 16 : 12
        };
        worksheet[cellAddress].s.alignment = {
          horizontal: 'center',
          vertical: 'center'
        };
        worksheet[cellAddress].s.fill = {
          fgColor: { rgb: 'E6F3FF' }
        };
      }
      
      // Table headers styling
      if (cellValue && typeof cellValue === 'string') {
        if (cellValue.includes('SR. NO') || cellValue.includes('ITEM DESCRIPTION') || 
            cellValue.includes('QTY') || cellValue.includes('AMOUNT')) {
          worksheet[cellAddress].s.font = {
            bold: true,
            size: 11
          };
          worksheet[cellAddress].s.alignment = {
            horizontal: 'center',
            vertical: 'center'
          };
          worksheet[cellAddress].s.fill = {
            fgColor: { rgb: 'CCCCCC' }
          };
        }
        
        // Total row styling
        if (cellValue.includes('TOTAL') && !cellValue.includes('CONDITIONS')) {
          worksheet[cellAddress].s.font = {
            bold: true,
            size: 11
          };
          worksheet[cellAddress].s.fill = {
            fgColor: { rgb: 'FFFF99' }
          };
        }
        
        // Amount summary styling
        if (cellValue.includes('TOTAL AMOUNT:')) {
          worksheet[cellAddress].s.font = {
            bold: true,
            size: 12
          };
          worksheet[cellAddress].s.fill = {
            fgColor: { rgb: 'FFE6E6' }
          };
        }
        
        // Terms & Conditions styling
        if (cellValue.includes('TERMS & CONDITIONS:')) {
          worksheet[cellAddress].s.font = {
            bold: true,
            size: 12,
            underline: true
          };
        }
      }
      
      // Align numbers to right
      if (typeof cellValue === 'number' || 
          (typeof cellValue === 'string' && cellValue.match(/^\d+\.?\d*$/))) {
        worksheet[cellAddress].s.alignment = {
          horizontal: 'right',
          vertical: 'center'
        };
      }
    }
  }
  
  return worksheet;
};

// Export quotation as Excel file
export const exportQuotationAsExcel = (quotationData, settings, options = {}) => {
  try {
    const workbook = createQuotationExcel(quotationData, settings, options);
    
    let filename = options.filename;
    if (!filename) {
      const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const partyName = quotationData.partyName || quotationData.orderSettings?.customerName || 'Quotation';
      filename = `${partyName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate}.xlsx`;
    }
    
    XLSX.writeFile(workbook, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createQuotationExcel,
  exportQuotationAsExcel
};
