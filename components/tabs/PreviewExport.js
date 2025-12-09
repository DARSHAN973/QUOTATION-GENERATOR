'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Edit, 
  ArrowLeft,
  FileSpreadsheet,
  Eye,
  Save,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Copy,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES, RATE_BASIS } from '../../data/constants.js';
import { generateDescription } from '../../utils/descriptions.js';
import { exportQuotationAsExcel, exportDetailedQuotation } from '../../utils/excelExport.js';
import { 
  downloadPDF, 
  copyPDFToClipboard, 
  generateWhatsAppMessage 
} from '../../utils/pdfExport.js';
import { downloadAlternativePDF } from '../../utils/pdfExportAlternative.js';
import { saveQuotation } from '../../utils/quotationStorage.js';
import CompanyLetterhead from '../quotation/CompanyLetterhead.js';
import QuotationActions from '../quotation/QuotationActions.js';
import { format } from 'date-fns';

const PreviewExport = () => {
  const { state, actions } = useApp();
  const { quotation, settings } = state;
  const { orderSettings, lineItems, totals, termsAndConditions, partyName, quotationDate, srNo } = quotation;
  
  const [editableDescriptions, setEditableDescriptions] = useState({});
  const [editingDescription, setEditingDescription] = useState(null);
  const [exportStatus, setExportStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState({});
  const quotationRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState({
    srNo: true,
    description: true,
    qty: true,
    unit: true,
    weight: true,
    ratePerKg: true,
    ratePerMtr: true,
    amount: true
  });

  // Generate descriptions for all line items
  useEffect(() => {
    const descriptions = {};
    lineItems.forEach(item => {
      if (!editableDescriptions[item.id]) {
        if (item.itemType === 'heading') {
          // For heading items, use the heading text as description
          descriptions[item.id] = item.headingText || 'Heading Item';
        } else {
          // For sub-items, generate normal description
          const desc = generateDescription(item.material, item.sizes, {
            pipeClass: item.pipeClass,
            schedule: item.schedule,
            make: item.make,
            thickness: item.thickness
          });
          descriptions[item.id] = desc.fullDescription;
        }
      }
    });
    setEditableDescriptions(prev => ({ ...prev, ...descriptions }));
  }, [lineItems]);

  // New action handlers
  const handleSaveQuotation = async () => {
    try {
      setIsLoading(true);
      const result = await saveQuotation(quotation);
      if (result.success) {
        setExportStatus('save-success');
        actions.setCurrentQuotationId(result.quotationId);
      } else {
        setExportStatus('error');
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      
      // Try the html2canvas method first
      try {
        await downloadPDF(quotationRef.current, quotation);
        setExportStatus('pdf-success');
      } catch (html2canvasError) {
        console.log('html2canvas failed, trying alternative method:', html2canvasError);
        
        // Fallback to alternative PDF method
        await downloadAlternativePDF(quotation);
        setExportStatus('pdf-success');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleCopyPDF = async () => {
    try {
      setIsLoading(true);
      
      // Try the html2canvas method first
      try {
        const result = await copyPDFToClipboard(quotationRef.current, quotation);
        if (result.success) {
          setExportStatus('copy-success');
        } else {
          setExportStatus('error');
        }
      } catch (html2canvasError) {
        console.log('html2canvas copy failed, generating alternative message:', html2canvasError);
        
        // Fallback: copy quotation text summary
        const quotationText = `Quotation Summary from Pipes & Flow Products\n\nTotal Items: ${lineItems.length}\nTotal Amount: ₹${totals.totalAmount.toFixed(2)}\n\nContact: (020) 66498383`;
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(quotationText);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = quotationText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        
        setExportStatus('copy-success');
      }
    } catch (error) {
      console.error('Error copying PDF:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setIsLoading(true);
      const messageData = await generateWhatsAppMessage(quotationRef.current, quotation);
      
      // Open WhatsApp Web with the message
      const encodedMessage = encodeURIComponent(messageData.message);
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      setExportStatus('whatsapp-success');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleCopyExcel = async () => {
    try {
      setIsLoading(true);
      // Generate Excel data as text for clipboard
      let excelText = `Quotation ${orderSettings.quotationNumber || orderSettings.srNo || 'DEC001'} - ${orderSettings.customerName || 'Customer'}\n\n`;
      excelText += `SR.NO\tDESCRIPTION\tQTY\tUNIT\tWEIGHT\tRATE/KG\tRATE/MTR\tAMOUNT\n`;
      
      lineItems.forEach((item, index) => {
        const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
        const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
        const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : item.finalRate / item.wtPerMtr;
        const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : item.finalRate * item.wtPerMtr;
        
        // Calculate hierarchical numbering
        let headingIndex = 0;
        let subItemIndex = 0;
        
        // Count headings before current item
        for (let i = 0; i < index; i++) {
          if (lineItems[i].itemType === 'heading') {
            headingIndex++;
          }
        }
        
        // If current item is heading, increment heading counter
        if (item.itemType === 'heading') {
          headingIndex++;
          const headingLetter = String.fromCharCode(64 + headingIndex);
          const headingText = editableDescriptions[item.id] || item.headingText || 'MS ERW PIPE B CLASS AS PER IS1239 MAKE Jindal';
          const sizeText = item.sizes && item.sizes.length > 0 ? item.sizes.join(', ') + ' NB' : '';
          
          excelText += `${headingLetter}.\t${headingText}\t\t\t\t\t\t\n`;
          if (sizeText) {
            excelText += `\tSize: ${sizeText}\t\t\t\t\t\t\n`;
          }
        } else {
          // For sub-items, count sub-items after last heading
          let lastHeadingIndex = -1;
          for (let i = index - 1; i >= 0; i--) {
            if (lineItems[i].itemType === 'heading') {
              lastHeadingIndex = i;
              break;
            }
          }
          
          for (let i = lastHeadingIndex + 1; i <= index; i++) {
            if (lineItems[i] && lineItems[i].itemType !== 'heading') {
              subItemIndex++;
            }
          }
          
          excelText += `${subItemIndex}.\t${editableDescriptions[item.id] || 'Loading...'}\t${qty.toFixed(2)}\t${unit}\t${item.totalKg.toFixed(2)}\t${ratePerKg.toFixed(2)}\t${ratePerMtr.toFixed(2)}\t${item.lineAmount.toFixed(2)}\n`;
        }
      });
      
      excelText += `\nTOTAL\t\t${totals.totalQty.toFixed(2)}\t\t${totals.totalWeight.toFixed(2)}\t\t\t${totals.totalAmount.toFixed(2)}`;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(excelText);
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = excelText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setExportStatus('copy-excel-success');
    } catch (error) {
      console.error('Error copying Excel data:', error);
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleBackToEdit = () => {
    actions.setActiveTab('new-quotation');
  };

  const handleExportBasic = async () => {
    try {
      setIsLoading(true);
      const result = exportQuotationAsExcel(quotation, settings, {
        columnVisibility,
        editableDescriptions
      });
      if (result.success) {
        setExportStatus('excel-success');
      } else {
        setExportStatus('error');
      }
    } catch (error) {
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleExportDetailed = async () => {
    try {
      setIsLoading(true);
      const result = exportDetailedQuotation(quotation, settings, {
        columnVisibility,
        editableDescriptions
      });
      if (result.success) {
        setExportStatus('excel-detailed-success');
      } else {
        setExportStatus('error');
      }
    } catch (error) {
      setExportStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const updateDescription = (itemId, newDescription) => {
    setEditableDescriptions(prev => ({
      ...prev,
      [itemId]: newDescription
    }));
    setEditingDescription(null);
  };

  if (lineItems.length === 0) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preview & Export</h1>
          <p className="text-gray-600 mt-2">Review your quotation and export to Excel</p>
        </div>
        
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items to Preview</h3>
          <p className="text-gray-600 mb-6">Add some line items to generate a quotation preview.</p>
          <button
            onClick={handleBackToEdit}
            className="flex items-center space-x-2 mx-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to New Quotation</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">{/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preview & Export</h1>
            <p className="text-gray-600 mt-2">Review your quotation and export to Excel</p>
          </div>
          
          <button
            onClick={handleBackToEdit}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Edit</span>
          </button>
        </div>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div className={`mb-6 flex items-center space-x-2 p-4 rounded-lg ${
          exportStatus.includes('success') 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {exportStatus.includes('success') && <CheckCircle className="w-5 h-5" />}
          {exportStatus === 'error' && <AlertTriangle className="w-5 h-5" />}
          <span>
            {exportStatus === 'save-success' && 'Quotation saved successfully!'}
            {exportStatus === 'pdf-success' && 'PDF exported successfully!'}
            {exportStatus === 'excel-success' && 'Excel exported successfully!'}
            {exportStatus === 'excel-detailed-success' && 'Detailed Excel exported successfully!'}
            {exportStatus === 'copy-success' && 'PDF copied to clipboard!'}
            {exportStatus === 'copy-excel-success' && 'Excel data copied to clipboard!'}
            {exportStatus === 'whatsapp-success' && 'WhatsApp opened with message!'}
            {exportStatus === 'error' && 'Error occurred. Please try again.'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <QuotationActions 
        onSave={handleSaveQuotation}
        onSendWhatsApp={handleSendWhatsApp}
        onCopyPDF={handleCopyPDF}
        onCopyExcel={handleCopyExcel}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportBasic}
        isLoading={isLoading}
        hasQuotationData={lineItems.length > 0}
      />

      {/* Edit Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Preview Options</h3>
            <p className="text-sm text-gray-600">Toggle edit mode to modify content directly in preview</p>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>{isEditMode ? 'Exit Edit Mode' : 'Enable Edit Mode'}</span>
          </button>
        </div>
      </div>

      {/* Column Visibility Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Column Visibility</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'srNo', label: 'SR. NO' },
            { key: 'description', label: 'Description' },
            { key: 'qty', label: 'Quantity' },
            { key: 'unit', label: 'Unit' },
            { key: 'weight', label: 'Weight' },
            { key: 'ratePerKg', label: 'Rate/Kg' },
            { key: 'ratePerMtr', label: 'Rate/Mtr' },
            { key: 'amount', label: 'Amount' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={columnVisibility[key]}
                onChange={(e) => setColumnVisibility(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quotation Preview</h2>
          </div>
        </div>
        
        {/* A4 Sized Preview Container */}
        <div 
          ref={quotationRef}
          className="quotation-preview bg-white"
          style={{ 
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1000px', // Increased width for better space utilization
            margin: '0 auto',
            minHeight: '800px', // Adjusted height for single page
            padding: '30px',
            boxSizing: 'border-box'
          }}
        >
          {/* Company Letterhead */}
          <CompanyLetterhead 
            quotationNumber={orderSettings.quotationNumber || srNo}
            quotationDate={quotationDate}
            customerName={partyName}
            isEditMode={isEditMode}
            onUpdate={(field, value) => {
              if (field === 'quotationDate') {
                actions.updateQuotationDate(value);
              } else if (field === 'customerName') {
                actions.updatePartyName(value);
              }
            }}
          />

          {/* Intro Text */}
          <div className="mb-6 text-sm text-black">
            {isEditMode ? (
              <>
                <div className="mb-2">
                  <input
                    type="text"
                    value={editableData.greeting || 'Respected Sir,'}
                    onChange={(e) => setEditableData(prev => ({...prev, greeting: e.target.value}))}
                    className="w-full bg-transparent border-none outline-none text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={editableData.thankYou || 'Thank you very much for your valued inquiry.'}
                    onChange={(e) => setEditableData(prev => ({...prev, thankYou: e.target.value}))}
                    className="w-full bg-transparent border-none outline-none text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    value={editableData.quoteIntro || 'We are pleased to quote our best rates as under:'}
                    onChange={(e) => setEditableData(prev => ({...prev, quoteIntro: e.target.value}))}
                    className="w-full bg-transparent border-none outline-none text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-black">{editableData.greeting || 'Respected Sir,'}</p>
                <p className="mb-2 text-black">{editableData.thankYou || 'Thank you very much for your valued inquiry.'}</p>
                <p className="mb-4 text-black">{editableData.quoteIntro || 'We are pleased to quote our best rates as under:'}</p>
              </>
            )}
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm text-black" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr className="bg-gray-100">
                  {columnVisibility.srNo && <th className="border border-gray-400 px-4 py-3 text-left text-black" style={{ width: '8%' }}>SR. NO</th>}
                  {columnVisibility.description && <th className="border border-gray-400 px-4 py-3 text-left text-black" style={{ width: '35%' }}>ITEM DESCRIPTION</th>}
                  {columnVisibility.qty && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '12%' }}>QTY</th>}
                  {columnVisibility.unit && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '8%' }}>UNIT</th>}
                  {columnVisibility.weight && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '12%' }}>WEIGHT</th>}
                  {columnVisibility.ratePerKg && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '10%' }}>RATE PER KGS</th>}
                  {columnVisibility.ratePerMtr && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '10%' }}>RATE PER MTRS</th>}
                  {columnVisibility.amount && <th className="border border-gray-400 px-4 py-3 text-center text-black" style={{ width: '15%' }}>AMOUNT</th>}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
                  const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
                  const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : (item.wtPerMtr ? item.finalRate / item.wtPerMtr : 0);
                  const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : (item.wtPerMtr ? item.finalRate * item.wtPerMtr : 0);
                  
                  // Calculate hierarchical numbering
                  let headingIndex = 0;
                  let subItemIndex = 0;
                  
                  // Count headings before current item
                  for (let i = 0; i < index; i++) {
                    if (lineItems[i].itemType === 'heading') {
                      headingIndex++;
                    }
                  }
                  
                  // If current item is heading, increment heading counter
                  if (item.itemType === 'heading') {
                    headingIndex++;
                  } else {
                    // For sub-items, count sub-items after last heading
                    let lastHeadingIndex = -1;
                    for (let i = index - 1; i >= 0; i--) {
                      if (lineItems[i].itemType === 'heading') {
                        lastHeadingIndex = i;
                        break;
                      }
                    }
                    
                    for (let i = lastHeadingIndex + 1; i <= index; i++) {
                      if (lineItems[i] && lineItems[i].itemType !== 'heading') {
                        subItemIndex++;
                      }
                    }
                  }
                  
                  const headingLetter = String.fromCharCode(64 + headingIndex); // A, B, C, D...

                  // Handle heading items
                  if (item.itemType === 'heading') {
                    const headingText = editableDescriptions[item.id] || item.headingText || 'MS ERW PIPE B CLASS AS PER IS1239 MAKE Jindal';
                    
                    return (
                      <React.Fragment key={item.id}>
                        {/* Main heading row */}
                        <tr className="bg-blue-50">
                          {columnVisibility.srNo && (
                            <td className="border border-gray-400 px-4 py-3 text-left text-black font-bold">
                              {headingLetter}.
                            </td>
                          )}
                          <td className="border border-gray-400 px-4 py-3 text-left text-black font-bold" colSpan="7">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={editableDescriptions[item.id] || headingText}
                                onChange={(e) => setEditableDescriptions(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-full bg-transparent border-none outline-none font-bold text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                                onBlur={(e) => {
                                  // Save to line items when user finishes editing
                                  const updatedItems = lineItems.map(lineItem => 
                                    lineItem.id === item.id 
                                      ? { ...lineItem, headingText: e.target.value }
                                      : lineItem
                                  );
                                  actions.updateLineItems(updatedItems);
                                }}
                              />
                            ) : (
                              headingText
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  }

                  // Handle sub-items
                  return (
                    <tr key={item.id}>
                      {columnVisibility.srNo && <td className="border border-gray-400 px-4 py-3 text-black">{subItemIndex}.</td>}
                      {columnVisibility.description && <td className="border border-gray-400 px-4 py-3 text-black pl-8">
                        {item.sizes && item.sizes.length > 0 ? `${item.sizes[0]}NB` : 'N/A'}
                      </td>}
                      {columnVisibility.qty && (
                        <td className="border border-gray-400 px-4 py-3 text-center text-black">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={editableData[`${item.id}_qty`] ?? qty.toFixed(2)}
                              onChange={(e) => setEditableData(prev => ({
                                ...prev,
                                [`${item.id}_qty`]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full bg-transparent border-none outline-none text-center text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 py-1"
                              onBlur={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                const updatedItems = lineItems.map(lineItem => 
                                  lineItem.id === item.id 
                                    ? { 
                                        ...lineItem, 
                                        ...(item.rateBasis === RATE_BASIS.PER_MTR 
                                          ? { totalMeters: newValue, totalKg: newValue * (lineItem.wtPerMtr || 1) }
                                          : { totalKg: newValue, totalMeters: newValue / (lineItem.wtPerMtr || 1) }
                                        )
                                      }
                                    : lineItem
                                );
                                actions.updateLineItems(updatedItems);
                              }}
                            />
                          ) : (
                            qty.toFixed(2)
                          )}
                        </td>
                      )}
                      {columnVisibility.unit && <td className="border border-gray-400 px-4 py-3 text-center text-black">{unit}</td>}
                      {columnVisibility.weight && (
                        <td className="border border-gray-400 px-4 py-3 text-center text-black">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={editableData[`${item.id}_weight`] ?? item.totalKg.toFixed(2)}
                              onChange={(e) => setEditableData(prev => ({
                                ...prev,
                                [`${item.id}_weight`]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full bg-transparent border-none outline-none text-center text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1 py-1"
                              onBlur={(e) => {
                                const newWeight = parseFloat(e.target.value) || 0;
                                const updatedItems = lineItems.map(lineItem => 
                                  lineItem.id === item.id 
                                    ? { ...lineItem, totalKg: newWeight }
                                    : lineItem
                                );
                                actions.updateLineItems(updatedItems);
                              }}
                            />
                          ) : (
                            item.totalKg.toFixed(2)
                          )}
                        </td>
                      )}
                      {columnVisibility.ratePerKg && <td className="border border-gray-400 px-4 py-3 text-center text-black">{ratePerKg.toFixed(2)}</td>}
                      {columnVisibility.ratePerMtr && <td className="border border-gray-400 px-4 py-3 text-center text-black">{ratePerMtr.toFixed(2)}</td>}
                      {columnVisibility.amount && <td className="border border-gray-400 px-4 py-3 text-center text-black">{item.lineAmount ? item.lineAmount.toFixed(2) : '0.00'}</td>}
                    </tr>
                  );
                })}

                {/* Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  {columnVisibility.srNo && <td className="border border-gray-400 px-4 py-3 text-black"></td>}
                  {columnVisibility.description && <td className="border border-gray-400 px-4 py-3 text-black">TOTAL</td>}
                  {columnVisibility.qty && <td className="border border-gray-400 px-4 py-3 text-center text-black">{totals.totalQty.toFixed(2)}</td>}
                  {columnVisibility.unit && <td className="border border-gray-400 px-4 py-3 text-center text-black"></td>}
                  {columnVisibility.weight && <td className="border border-gray-400 px-4 py-3 text-center text-black">{totals.totalWeight.toFixed(2)}</td>}
                  {columnVisibility.ratePerKg && <td className="border border-gray-400 px-4 py-3 text-center text-black"></td>}
                  {columnVisibility.ratePerMtr && <td className="border border-gray-400 px-4 py-3 text-center text-black"></td>}
                  {columnVisibility.amount && <td className="border border-gray-400 px-4 py-3 text-center text-black">{totals.netAmount.toFixed(2)}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Summary with Thank You */}
          <div className="flex justify-end mb-8">
            <div className="w-80 text-sm">
              <div className="border-t border-gray-400 pt-3">
                <div className="flex justify-between font-semibold text-lg text-black mb-4">
                  <span className="text-black">TOTAL AMOUNT:</span>
                  <span className="text-black">₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-sm text-black mb-8">
            <h3 className="font-semibold mb-3 text-black underline">TERMS & CONDITIONS:</h3>
            
            {orderSettings.supplyType === SUPPLY_TYPES.GODOWN ? (
              <div className="space-y-2 text-black">
                <p className="text-black">1. Payment term: 
                  {termsAndConditions.paymentTerm === 'custom' ? (
                    <span className="font-medium"> {termsAndConditions.customPaymentTerm || 'Against Delivery'}</span>
                  ) : (
                    <span className="font-medium"> {termsAndConditions.paymentTerm || 'Against Delivery'}</span>
                  )}
                  {(() => {
                    const discountItems = lineItems.filter(item => item.discountMode === 'show' && item.discountPercent > 0);
                    if (discountItems.length > 0) {
                      const totalDiscountPercent = discountItems.reduce((sum, item) => sum + item.discountPercent, 0);
                      return <span className="font-medium"> - Less: {totalDiscountPercent}% discount</span>;
                    }
                    return null;
                  })()}
                </p>
                <p className="text-black">2. +{orderSettings.gst || 18}% GST EXTRA</p>
                {termsAndConditions.showTransportExtra && <p className="text-black">3. TRANSPORT EXTRA AT ACTUAL.</p>}
                {termsAndConditions.showLoadingExtra && <p className="text-black">4. LOADING EXTRA</p>}
                <p className="text-black">5. UNLOADING EXTRA IN YOUR ACCOUNT</p>
                <p className="text-black">6. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID</p>
                <p className="text-black">7. RATES VALID TILL {termsAndConditions.validTillDate ? format(new Date(termsAndConditions.validTillDate), 'dd/MM/yyyy') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}</p>
                {termsAndConditions.showGodownLocation && <p className="text-black">8. PIPES RATES EX- {orderSettings.godown?.toUpperCase() || 'WAGHOLI'} GODOWN</p>}
              </div>
            ) : (
              <div className="space-y-2 text-black">
                <p className="text-black">1. Delivery: [Address to be specified]</p>
                <p className="text-black">2. Payment against proforma – 100% advance
                  {(() => {
                    const discountItems = lineItems.filter(item => item.discountMode === 'show' && item.discountPercent > 0);
                    if (discountItems.length > 0) {
                      const totalDiscountPercent = discountItems.reduce((sum, item) => sum + item.discountPercent, 0);
                      return <span className="font-medium"> - Less: {totalDiscountPercent}% discount</span>;
                    }
                    return null;
                  })()}
                </p>
                <p className="text-black">3. Free delivery from Jindal in 20 ton multiples</p>
                <p className="text-black">4. Dead freight for part loads will be charged extra</p>
                <p className="text-black">5. Material will be dispatched from Wagholi godown</p>
                <p className="text-black">6. Unloading extra in your A/c</p>
                <p className="text-black">7. Delivery within one week from receipt of order and payment</p>
                <p className="text-black">8. Late payment charges @ 18% per annum</p>
                <p className="text-black">9. In case of increase in steel prices, above rates will not be valid</p>
                <p className="text-black">10. RATES VALID TILL {termsAndConditions.validTillDate ? format(new Date(termsAndConditions.validTillDate), 'dd/MM/yyyy') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}</p>
              </div>
            )}
          </div>

          {/* Thank You and Signature */}
          <div className="mt-12 text-sm text-black">
            <p className="mb-8 text-black">Thank you for your valued inquiry. We look forward to receiving your valuable order.</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-black">With Best Regards,</p>
                <p className="text-black font-semibold">Pipes & Flow Products</p>
              </div>
              
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 w-40">
                  <p className="text-black text-xs">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Export Actions - Keep for compatibility */}
      <div className="flex space-x-4">
        <button
          onClick={handleExportDetailed}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export Detailed Excel</span>
        </button>

        <button
          onClick={handleBackToEdit}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Quotation</span>
        </button>
      </div>
    </div>
  );
};

export default PreviewExport;