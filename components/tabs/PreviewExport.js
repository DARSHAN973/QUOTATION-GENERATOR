'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Edit, 
  ArrowLeft,
  FileSpreadsheet,
  Eye,
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES, RATE_BASIS } from '../../data/constants.js';
import { generateDescription } from '../../utils/descriptions.js';
import { exportQuotationAsExcel, exportDetailedQuotation } from '../../utils/excelExport.js';
import { format } from 'date-fns';

const PreviewExport = () => {
  const { state, actions } = useApp();
  const { quotation, settings } = state;
  const { orderSettings, lineItems, totals } = quotation;
  
  const [editableDescriptions, setEditableDescriptions] = useState({});
  const [editingDescription, setEditingDescription] = useState(null);
  const [paymentTerm, setPaymentTerm] = useState('Against Delivery');
  const [validTillDate, setValidTillDate] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [exportStatus, setExportStatus] = useState('');

  // Generate descriptions for all line items
  useEffect(() => {
    const descriptions = {};
    lineItems.forEach(item => {
      if (!editableDescriptions[item.id]) {
        const desc = generateDescription(item.material, item.sizes, {
          pipeClass: item.pipeClass,
          schedule: item.schedule,
          make: item.make,
          thickness: item.thickness
        });
        descriptions[item.id] = desc.fullDescription;
      }
    });
    setEditableDescriptions(prev => ({ ...prev, ...descriptions }));
  }, [lineItems]);

  const handleBackToEdit = () => {
    actions.setActiveTab('new-quotation');
  };

  const handleExportBasic = async () => {
    try {
      const result = exportQuotationAsExcel(quotation, settings);
      if (result.success) {
        setExportStatus('success');
        setTimeout(() => setExportStatus(''), 3000);
      } else {
        setExportStatus('error');
        setTimeout(() => setExportStatus(''), 3000);
      }
    } catch (error) {
      setExportStatus('error');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const handleExportDetailed = async () => {
    try {
      const result = exportDetailedQuotation(quotation, settings);
      if (result.success) {
        setExportStatus('success');
        setTimeout(() => setExportStatus(''), 3000);
      } else {
        setExportStatus('error');
        setTimeout(() => setExportStatus(''), 3000);
      }
    } catch (error) {
      setExportStatus('error');
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
      <div className="p-8">
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
    <div className="p-8">
      {/* Header */}
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
          exportStatus === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {exportStatus === 'success' && <CheckCircle className="w-5 h-5" />}
          {exportStatus === 'error' && <AlertTriangle className="w-5 h-5" />}
          <span>
            {exportStatus === 'success' && 'Quotation exported successfully!'}
            {exportStatus === 'error' && 'Error exporting quotation. Please try again.'}
          </span>
        </div>
      )}

      {/* Preview Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Quotation Preview</h2>
          </div>
        </div>
        
        <div className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Quotation Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">QUOTATION</h1>
          </div>

          {/* Intro Text */}
          <div className="mb-6 text-sm">
            <p className="mb-2">Respected Sir,</p>
            <p className="mb-2">Thank you very much for your valued inquiry.</p>
            <p className="mb-4">We are pleased to quote our best rates as under:</p>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left">SR. NO</th>
                  <th className="border border-gray-400 px-3 py-2 text-left">ITEM DESCRIPTION</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">QTY</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">UNIT</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">WEIGHT</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">RATE PER KGS</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">RATE PER MTRS</th>
                  <th className="border border-gray-400 px-3 py-2 text-center">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
                  const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
                  const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : item.finalRate / item.wtPerMtr;
                  const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : item.finalRate * item.wtPerMtr;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Header Row */}
                      <tr>
                        <td className="border border-gray-400 px-3 py-2 font-semibold">{index + 1}.</td>
                        <td className="border border-gray-400 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {editableDescriptions[item.id]?.split('\n')[0] || 'Loading...'}
                            </span>
                            <button
                              onClick={() => setEditingDescription(item.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                        <td className="border border-gray-400 px-3 py-2 text-center"></td>
                      </tr>
                      
                      {/* Description editing modal */}
                      {editingDescription === item.id && (
                        <tr>
                          <td colSpan="8" className="border border-gray-400 p-3 bg-gray-50">
                            <div>
                              <label className="block text-sm font-medium mb-2">Edit Description:</label>
                              <textarea
                                value={editableDescriptions[item.id] || ''}
                                onChange={(e) => setEditableDescriptions(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-full h-24 p-2 border border-gray-300 rounded text-sm"
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={() => setEditingDescription(null)}
                                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => updateDescription(item.id, editableDescriptions[item.id])}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Sub-lines for sizes */}
                      {editableDescriptions[item.id]?.split('\n').slice(1).map((subLine, subIndex) => (
                        subLine.trim() && (
                          <tr key={`${item.id}-${subIndex}`}>
                            <td className="border border-gray-400 px-3 py-2"></td>
                            <td className="border border-gray-400 px-3 py-2 pl-8">{subLine}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{qty.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{unit}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{item.totalKg.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{ratePerKg.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{ratePerMtr.toFixed(2)}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{item.lineAmount.toFixed(2)}</td>
                          </tr>
                        )
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border border-gray-400 px-3 py-2"></td>
                  <td className="border border-gray-400 px-3 py-2">TOTAL</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{totals.totalQty.toFixed(2)}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center"></td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{totals.totalWeight.toFixed(2)}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center"></td>
                  <td className="border border-gray-400 px-3 py-2 text-center"></td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{totals.netAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 text-sm">
              <div className="flex justify-between border-b pb-1 mb-1">
                <span>NET AMOUNT:</span>
                <span>₹{totals.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 mb-1">
                <span>GST {orderSettings.gst}%:</span>
                <span>₹{totals.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>TOTAL AMOUNT:</span>
                <span>₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-sm">
            <h3 className="font-semibold mb-3">TERMS & CONDITIONS:</h3>
            
            {orderSettings.supplyType === SUPPLY_TYPES.GODOWN ? (
              <div className="space-y-1">
                <p>1. Payment term: 
                  <select
                    value={paymentTerm}
                    onChange={(e) => setPaymentTerm(e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option>Against Delivery</option>
                    <option>Within 15 Days</option>
                    <option>Within 30 Days</option>
                    <option>50% Advance - 50% Against Delivery</option>
                  </select>
                </p>
                <p>2. +{orderSettings.gst}% GST EXTRA</p>
                <p>3. TRANSPORT EXTRA AT ACTUAL.</p>
                <p>4. LOADING EXTRA</p>
                <p>5. UNLOADING EXTRA IN YOUR ACCOUNT</p>
                <p>6. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID</p>
                <p>7. RATES VALID TILL 
                  <input
                    type="date"
                    value={validTillDate}
                    onChange={(e) => setValidTillDate(e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </p>
                <p>8. PIPES RATES EX- {orderSettings.godown?.toUpperCase()} GODOWN</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p>1. Delivery: [Address to be specified]</p>
                <p>2. Payment against proforma – 100% advance</p>
                <p>3. Free delivery from Jindal in 20 ton multiples</p>
                <p>4. Dead freight for part loads will be charged extra</p>
                <p>5. Material will be dispatched from Wagholi godown</p>
                <p>6. Unloading extra in your A/c</p>
                <p>7. Delivery within one week from receipt of order and payment</p>
                <p>8. Late payment charges @ 18% per annum</p>
                <p>9. In case of increase in steel prices, above rates will not be valid</p>
                <p>10. RATES VALID TILL 
                  <input
                    type="date"
                    value={validTillDate}
                    onChange={(e) => setValidTillDate(e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handleExportBasic}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          <span>Export to Excel</span>
        </button>

        <button
          onClick={handleExportDetailed}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export Detailed</span>
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