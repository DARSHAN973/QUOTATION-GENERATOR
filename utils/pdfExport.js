// PDF Export Utilities
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Generate PDF from quotation preview element
export const generateQuotationPDF = async (quotationElement, quotationData) => {
  try {
    if (!quotationElement) {
      throw new Error('Quotation element not found');
    }

    // Create a clone of the element to modify for PDF generation
    const clonedElement = quotationElement.cloneNode(true);
    
    // Fix color issues by converting modern CSS colors to basic colors
    const fixColors = (element) => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const computedStyle = window.getComputedStyle(node);
        
        // Force basic colors for better compatibility
        if (node.style) {
          node.style.color = '#000000';
          node.style.backgroundColor = node.style.backgroundColor || 'transparent';
          
          // Remove any problematic CSS properties
          node.style.colorScheme = 'light';
          node.style.filter = 'none';
        }
        
        // Ensure all text is black for PDF
        if (node.classList && (
          node.classList.contains('text-black') || 
          node.classList.contains('text-gray-900') ||
          node.classList.contains('text-gray-700')
        )) {
          node.style.color = '#000000';
        }
      }
    };

    // Apply color fixes
    fixColors(clonedElement);
    
    // Temporarily add the cloned element to the DOM for rendering
    clonedElement.style.position = 'absolute';
    clonedElement.style.top = '-10000px';
    clonedElement.style.left = '-10000px';
    clonedElement.style.width = '1000px'; // Increased width for better layout
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.color = '#000000';
    document.body.appendChild(clonedElement);

    // Configure html2canvas for better PDF quality
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Higher DPI for better quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 1000, // Wider canvas
      height: clonedElement.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
      windowHeight: 800,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.classList && (
          element.classList.contains('print-hidden') ||
          element.tagName === 'BUTTON' ||
          element.tagName === 'INPUT' ||
          element.tagName === 'SELECT' ||
          element.tagName === 'TEXTAREA'
        );
      },
      onclone: (clonedDoc) => {
        // Additional cleanup in the cloned document
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            color: #000000 !important;
            background-color: transparent !important;
          }
          .company-letterhead * {
            color: #000000 !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #000000 !important;
            color: #000000 !important;
          }
          th {
            background-color: #f0f0f0 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    // Remove the temporary element
    document.body.removeChild(clonedElement);

    // Create PDF with landscape orientation for wider content
    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const margin = 15;
    const printableWidth = pageWidth - (margin * 2);

    // Calculate scale to fit content
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const scale = (printableWidth * 3.779527559) / canvasWidth; // Convert mm to px

    const scaledWidth = canvasWidth * scale / 3.779527559; // Convert back to mm
    const scaledHeight = canvasHeight * scale / 3.779527559;

    // Create PDF in landscape mode for wider content
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add the canvas as image
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Center the image on the page
    const x = (pageWidth - scaledWidth) / 2;
    const y = margin;

    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight, '', 'FAST');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Quotation_PipesFlow_${timestamp}.pdf`;

    return {
      pdf,
      filename,
      success: true
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Download PDF file
export const downloadPDF = async (quotationElement, quotationData) => {
  const result = await generateQuotationPDF(quotationElement, quotationData);
  
  if (result.success) {
    result.pdf.save(result.filename);
    return result;
  } else {
    throw new Error(result.error);
  }
};

// Generate PDF blob for sharing
export const generatePDFBlob = async (quotationElement, quotationData) => {
  const result = await generateQuotationPDF(quotationElement, quotationData);
  
  if (result.success) {
    const blob = result.pdf.output('blob');
    return {
      blob,
      filename: result.filename,
      success: true
    };
  } else {
    throw new Error(result.error);
  }
};

// Copy PDF as base64 to clipboard
export const copyPDFToClipboard = async (quotationElement, quotationData) => {
  try {
    const result = await generateQuotationPDF(quotationElement, quotationData);
    
    if (result.success) {
      const base64String = result.pdf.output('datauristring');
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(base64String);
        return {
          success: true,
          message: 'PDF copied to clipboard as base64 string'
        };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = base64String;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return {
          success: true,
          message: 'PDF copied to clipboard'
        };
      }
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error copying PDF to clipboard:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate WhatsApp message with PDF
export const generateWhatsAppMessage = async (quotationElement, quotationData) => {
  const customerName = quotationData?.orderSettings?.customerName || 'Sir/Madam';
  const totalAmount = quotationData?.totals?.totalAmount || 0;
  
  const message = `Dear ${customerName},

Thank you for your inquiry. Please find attached our quotation for pipe materials.

*Quotation Summary:*
Total Amount: ₹${totalAmount.toLocaleString('en-IN')}
Items: ${quotationData?.lineItems?.length || 0}

We look forward to your valuable order.

Best Regards,
Pipes & Flow Products
Contact: (020) 66498383`;

  return {
    message,
    phoneNumber: '', // Can be filled by user
    success: true
  };
};

export default {
  generateQuotationPDF,
  downloadPDF,
  generatePDFBlob,
  copyPDFToClipboard,
  generateWhatsAppMessage
};