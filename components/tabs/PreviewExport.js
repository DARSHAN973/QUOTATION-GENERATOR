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
  const { orderSettings, lineItems, totals, termsAndConditions } = quotation;
  
  const [editableDescriptions, setEditableDescriptions] = useState({});
  const [editingDescription, setEditingDescription] = useState(null);
  const [exportStatus, setExportStatus] = useState('');
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
      const result = exportQuotationAsExcel(quotation, settings, {
        columnVisibility,
        editableDescriptions
      });
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
      const result = exportDetailedQuotation(quotation, settings, {
        columnVisibility,
        editableDescriptions
      });
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
        
        <div className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Quotation Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">QUOTATION</h1>
          </div>

          {/* Intro Text */}
          <div className="mb-6 text-sm text-black">
            <p className="mb-2 text-black">Respected Sir,</p>
            <p className="mb-2 text-black">Thank you very much for your valued inquiry.</p>
            <p className="mb-4 text-black">We are pleased to quote our best rates as under:</p>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm text-black">
              <thead>
                <tr className="bg-gray-100">
                  {columnVisibility.srNo && <th className="border border-gray-400 px-3 py-2 text-left text-black">SR. NO</th>}
                  {columnVisibility.description && <th className="border border-gray-400 px-3 py-2 text-left text-black">ITEM DESCRIPTION</th>}
                  {columnVisibility.qty && <th className="border border-gray-400 px-3 py-2 text-center text-black">QTY</th>}
                  {columnVisibility.unit && <th className="border border-gray-400 px-3 py-2 text-center text-black">UNIT</th>}
                  {columnVisibility.weight && <th className="border border-gray-400 px-3 py-2 text-center text-black">WEIGHT</th>}
                  {columnVisibility.ratePerKg && <th className="border border-gray-400 px-3 py-2 text-center text-black">RATE PER KGS</th>}
                  {columnVisibility.ratePerMtr && <th className="border border-gray-400 px-3 py-2 text-center text-black">RATE PER MTRS</th>}
                  {columnVisibility.amount && <th className="border border-gray-400 px-3 py-2 text-center text-black">AMOUNT</th>}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const qty = item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
                  const unit = item.rateBasis === RATE_BASIS.PER_MTR ? 'MTRS' : 'KGS';
                  const ratePerKg = item.rateBasis === RATE_BASIS.PER_KG ? item.finalRate : item.finalRate / item.wtPerMtr;
                  const ratePerMtr = item.rateBasis === RATE_BASIS.PER_MTR ? item.finalRate : item.finalRate * item.wtPerMtr;

                  // Generate main SR NO as A, B, C...
                  const mainSrNo = String.fromCharCode(65 + index); // A, B, C, D...

                  return (
                    <React.Fragment key={item.id}>
                      {/* Header Row */}
                      <tr>
                        {columnVisibility.srNo && <td className="border border-gray-400 px-3 py-2 font-semibold text-black">{mainSrNo}.</td>}
                        {columnVisibility.description && <td className="border border-gray-400 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-black">
                              {editableDescriptions[item.id]?.split('\n')[0] || 'Loading...'}
                            </span>
                            <button
                              onClick={() => setEditingDescription(item.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </td>}
                        {columnVisibility.qty && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                        {columnVisibility.unit && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                        {columnVisibility.weight && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                        {columnVisibility.ratePerKg && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                        {columnVisibility.ratePerMtr && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                        {columnVisibility.amount && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                      </tr>
                      
                      {/* Description editing modal */}
                      {editingDescription === item.id && (
                        <tr>
                          <td colSpan={Object.values(columnVisibility).filter(Boolean).length} className="border border-gray-400 p-3 bg-gray-50">
                            <div>
                              <label className="block text-sm font-medium mb-2">Edit Description:</label>
                              <textarea
                                value={editableDescriptions[item.id] || ''}
                                onChange={(e) => setEditableDescriptions(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-full h-24 p-2 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                            {columnVisibility.srNo && <td className="border border-gray-400 px-3 py-2 text-black">{subIndex + 1}.</td>}
                            {columnVisibility.description && <td className="border border-gray-400 px-3 py-2 pl-8 text-black">{subLine}</td>}
                            {columnVisibility.qty && <td className="border border-gray-400 px-3 py-2 text-center text-black">{qty.toFixed(2)}</td>}
                            {columnVisibility.unit && <td className="border border-gray-400 px-3 py-2 text-center text-black">{unit}</td>}
                            {columnVisibility.weight && <td className="border border-gray-400 px-3 py-2 text-center text-black">{item.totalKg.toFixed(2)}</td>}
                            {columnVisibility.ratePerKg && <td className="border border-gray-400 px-3 py-2 text-center text-black">{ratePerKg.toFixed(2)}</td>}
                            {columnVisibility.ratePerMtr && <td className="border border-gray-400 px-3 py-2 text-center text-black">{ratePerMtr.toFixed(2)}</td>}
                            {columnVisibility.amount && <td className="border border-gray-400 px-3 py-2 text-center text-black">{item.lineAmount.toFixed(2)}</td>}
                          </tr>
                        )
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* Totals Row */}
                <tr className="bg-gray-50 font-semibold">
                  {columnVisibility.srNo && <td className="border border-gray-400 px-3 py-2 text-black"></td>}
                  {columnVisibility.description && <td className="border border-gray-400 px-3 py-2 text-black">TOTAL</td>}
                  {columnVisibility.qty && <td className="border border-gray-400 px-3 py-2 text-center text-black">{totals.totalQty.toFixed(2)}</td>}
                  {columnVisibility.unit && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                  {columnVisibility.weight && <td className="border border-gray-400 px-3 py-2 text-center text-black">{totals.totalWeight.toFixed(2)}</td>}
                  {columnVisibility.ratePerKg && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                  {columnVisibility.ratePerMtr && <td className="border border-gray-400 px-3 py-2 text-center text-black"></td>}
                  {columnVisibility.amount && <td className="border border-gray-400 px-3 py-2 text-center text-black">{totals.netAmount.toFixed(2)}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 text-sm">
              <div className="flex justify-between font-semibold text-lg text-black">
                <span className="text-black">TOTAL AMOUNT:</span>
                <span className="text-black">₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-sm text-black">
            <h3 className="font-semibold mb-3 text-black">TERMS & CONDITIONS:</h3>
            
            {orderSettings.supplyType === SUPPLY_TYPES.GODOWN ? (
              <div className="space-y-1 text-black">
                <p className="text-black">1. Payment term: 
                  {termsAndConditions.paymentTerm === 'custom' ? (
                    <input
                      type="text"
                      value={termsAndConditions.customPaymentTerm}
                      onChange={(e) => actions.updateTermsAndConditions({ customPaymentTerm: e.target.value })}
                      className="ml-2 px-2 py-1 border border-gray-300 bg-yellow-50 text-gray-900 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter payment term"
                    />
                  ) : (
                    <select
                      value={termsAndConditions.paymentTerm}
                      onChange={(e) => actions.updateTermsAndConditions({ paymentTerm: e.target.value })}
                      className="ml-2 px-2 py-1 border border-gray-300 bg-yellow-50 text-gray-900 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Against Delivery</option>
                      <option>Within 15 Days</option>
                      <option>Within 30 Days</option>
                      <option>50% Advance - 50% Against Delivery</option>
                      <option>100% Advance</option>
                      <option value="custom">Custom</option>
                    </select>
                  )}
                </p>
                <p className="text-black">2. +{orderSettings.gst}% GST EXTRA</p>
                {termsAndConditions.showTransportExtra && <p className="text-black">3. TRANSPORT EXTRA AT ACTUAL.</p>}
                {termsAndConditions.showLoadingExtra && <p className="text-black">4. LOADING EXTRA</p>}
                <p className="text-black">5. UNLOADING EXTRA IN YOUR ACCOUNT</p>
                <p className="text-black">6. IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID</p>
                <p className="text-black">7. RATES VALID TILL 
                  <input
                    type="date"
                    value={termsAndConditions.validTillDate}
                    onChange={(e) => actions.updateTermsAndConditions({ validTillDate: e.target.value })}
                    className="ml-2 px-2 py-1 border border-gray-300 bg-yellow-50 text-gray-900 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </p>
                {termsAndConditions.showGodownLocation && <p className="text-black">8. PIPES RATES EX- {orderSettings.godown?.toUpperCase()} GODOWN</p>}
              </div>
            ) : (
              <div className="space-y-1 text-black">
                <p className="text-black">1. Delivery: [Address to be specified]</p>
                <p className="text-black">2. Payment against proforma – 100% advance</p>
                <p className="text-black">3. Free delivery from Jindal in 20 ton multiples</p>
                <p className="text-black">4. Dead freight for part loads will be charged extra</p>
                <p className="text-black">5. Material will be dispatched from Wagholi godown</p>
                <p className="text-black">6. Unloading extra in your A/c</p>
                <p className="text-black">7. Delivery within one week from receipt of order and payment</p>
                <p className="text-black">8. Late payment charges @ 18% per annum</p>
                <p className="text-black">9. In case of increase in steel prices, above rates will not be valid</p>
                <p className="text-black">10. RATES VALID TILL 
                  <input
                    type="date"
                    value={termsAndConditions.validTillDate}
                    onChange={(e) => actions.updateTermsAndConditions({ validTillDate: e.target.value })}
                    className="ml-2 px-2 py-1 border border-gray-300 bg-yellow-50 text-gray-900 rounded text-sm focus:ring-2 focus:ring-blue-500"
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