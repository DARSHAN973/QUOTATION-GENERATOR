// Alternative PDF Export using jsPDF without html2canvas
import jsPDF from 'jspdf';

export const generateQuotationPDFAlternative = (quotationData) => {
  try {
    const { orderSettings, lineItems, totals, termsAndConditions } = quotationData;
    
    // Create PDF with landscape orientation for wider content
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    let yPos = 15; // Current Y position
    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to add text
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 10, fontStyle = 'normal', align = 'left', maxWidth } = options;
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        return lines.length * (fontSize * 0.35); // Return height used
      } else {
        pdf.text(text, x, y, { align });
        return fontSize * 0.35; // Return height used
      }
    };

    // Company Header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(2);
    pdf.rect(margin, yPos, contentWidth, 35); // Reduced height for landscape
    
    yPos += 7;
    addText('PIPES & FLOW PRODUCTS', pageWidth / 2, yPos, { 
      fontSize: 16, 
      fontStyle: 'bold', 
      align: 'center' 
    });
    
    yPos += 6;
    addText('Office No F-6 1st Floor North Block Sacred World Above KFC', pageWidth / 2, yPos, { 
      fontSize: 9, 
      align: 'center' 
    });
    
    yPos += 4;
    addText('Jagtap Chowk Shivarkar Rd Wanowrie Pune', pageWidth / 2, yPos, { 
      fontSize: 9, 
      align: 'center' 
    });
    
    yPos += 4;
    addText('Tel: (020) 66498383 | Telefax: (020) 66498306', pageWidth / 2, yPos, { 
      fontSize: 9, 
      align: 'center' 
    });
    
    yPos += 6;
    addText('PAN: AABFP4798B | MSME: MH26A0092202 | GSTIN: 27AABFP4798B1Z5 | State: Maharashtra, Code: 27', pageWidth / 2, yPos, { 
      fontSize: 8, 
      align: 'center' 
    });

    yPos += 15;

    // Quotation Title
    addText('QUOTATION', pageWidth / 2, yPos, { 
      fontSize: 16, 
      fontStyle: 'bold', 
      align: 'center' 
    });
    
    yPos += 15;

    // Introduction
    addText('Respected Sir,', margin, yPos);
    yPos += 5;
    addText('Thank you very much for your valued inquiry.', margin, yPos);
    yPos += 5;
    addText('We are pleased to quote our best rates as under:', margin, yPos);
    yPos += 10;

    // Table header with optimized column widths for landscape
    const tableStartY = yPos;
    const colWidths = [20, 90, 25, 20, 25, 25, 25, 35]; // Wider columns for landscape
    const headers = ['SR.', 'DESCRIPTION', 'QTY', 'UNIT', 'WEIGHT', 'RATE/KG', 'RATE/MTR', 'AMOUNT'];
    
    let xPos = margin;
    
    // Draw table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    
    headers.forEach((header, index) => {
      pdf.setLineWidth(0.5);
      pdf.rect(xPos, yPos, colWidths[index], 8);
      addText(header, xPos + 2, yPos + 5, { fontSize: 8, fontStyle: 'bold' });
      xPos += colWidths[index];
    });
    
    yPos += 8;

    // Table rows
    lineItems.forEach((item, index) => {
      const srNo = String.fromCharCode(65 + index); // A, B, C...
      const qty = item.rateBasis === 'PER_MTR' ? item.totalMeters : item.totalKg;
      const unit = item.rateBasis === 'PER_MTR' ? 'MTRS' : 'KGS';
      const rate = item.finalRate;
      const amount = item.lineAmount;
      
      xPos = margin;
      
      // Draw row
      const rowData = [
        srNo,
        item.material + ' ' + item.sizes.join(', '),
        qty.toFixed(2),
        unit,
        item.totalKg.toFixed(2),
        (item.rateBasis === 'PER_KG' ? rate : rate / item.wtPerMtr).toFixed(2),
        (item.rateBasis === 'PER_MTR' ? rate : rate * item.wtPerMtr).toFixed(2),
        amount.toFixed(2)
      ];
      
      rowData.forEach((data, colIndex) => {
        pdf.setLineWidth(0.5);
        pdf.rect(xPos, yPos, colWidths[colIndex], 6);
        
        if (colIndex === 1) {
          // Description column - might need word wrap
          const textHeight = addText(data, xPos + 1, yPos + 4, { 
            fontSize: 7, 
            maxWidth: colWidths[colIndex] - 2 
          });
        } else {
          addText(data, xPos + 1, yPos + 4, { fontSize: 8 });
        }
        
        xPos += colWidths[colIndex];
      });
      
      yPos += 6;
    });

    // Total row
    xPos = margin;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos, contentWidth, 6, 'F');
    
    const totalData = [
      '',
      'TOTAL',
      totals.totalQty.toFixed(2),
      '',
      totals.totalWeight.toFixed(2),
      '',
      '',
      totals.totalAmount.toFixed(2)
    ];
    
    totalData.forEach((data, colIndex) => {
      pdf.setLineWidth(0.5);
      pdf.rect(xPos, yPos, colWidths[colIndex], 6);
      addText(data, xPos + 1, yPos + 4, { fontSize: 8, fontStyle: 'bold' });
      xPos += colWidths[colIndex];
    });
    
    yPos += 15;

    // Terms & Conditions
    addText('TERMS & CONDITIONS:', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
    yPos += 8;
    
    const terms = [
      `1. Payment term: Against Delivery`,
      `2. +18% GST EXTRA`,
      `3. UNLOADING EXTRA IN YOUR ACCOUNT`,
      `4. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID`,
      `5. RATES VALID TILL ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}`
    ];
    
    terms.forEach(term => {
      addText(term, margin, yPos, { fontSize: 9 });
      yPos += 5;
    });
    
    yPos += 10;

    // Closing
    addText('Thank you for your valued inquiry. We look forward to receiving your valuable order.', margin, yPos, {
      fontSize: 9,
      maxWidth: contentWidth
    });
    
    yPos += 15;
    addText('With Best Regards,', margin, yPos);
    yPos += 5;
    addText('Pipes & Flow Products', margin, yPos, { fontStyle: 'bold' });

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Quotation_PipesFlow_${timestamp}.pdf`;

    return {
      pdf,
      filename,
      success: true
    };
    
  } catch (error) {
    console.error('Error generating alternative PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const downloadAlternativePDF = async (quotationData) => {
  const result = generateQuotationPDFAlternative(quotationData);
  
  if (result.success) {
    result.pdf.save(result.filename);
    return result;
  } else {
    throw new Error(result.error);
  }
};