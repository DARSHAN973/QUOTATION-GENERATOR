'use client';

import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Factory, 
  Percent,
  RadioIcon,
  Building2,
  Truck,
  Save,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES, GODOWNS } from '../../data/constants.js';
import { clsx } from 'clsx';

const OrderSettings = () => {
  const { state, actions } = useApp();
  const { orderSettings, partyName, srNo, quotationDate } = state.quotation;
  
  const [isEditingSrNo, setIsEditingSrNo] = useState(false);
  const [tempSrNo, setTempSrNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generate SR number when component mounts
  useEffect(() => {
    const generateSrNumber = async () => {
      if (!srNo) {
        try {
          const response = await fetch('/api/quotations/generate-sr');
          if (response.ok) {
            const { srNo: newSrNo } = await response.json();
            actions.updateQuotationHeader({ srNo: newSrNo });
          } else {
            // Fallback to client-side generation
            const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
            const nextNumber = 1;
            const fallbackSrNo = `${currentMonth}${nextNumber.toString().padStart(3, '0')}`;
            actions.updateQuotationHeader({ srNo: fallbackSrNo });
          }
        } catch (error) {
          console.error('Error generating SR number:', error);
          // Fallback to client-side generation
          const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
          const nextNumber = 1;
          const fallbackSrNo = `${currentMonth}${nextNumber.toString().padStart(3, '0')}`;
          actions.updateQuotationHeader({ srNo: fallbackSrNo });
        }
      }
    };

    generateSrNumber();
  }, []);

  // Save quotation to database
  const handleSaveQuotation = async () => {
    if (!partyName.trim()) {
      alert('Please enter Party Name before saving');
      return;
    }

    setIsSaving(true);
    try {
      const quotationData = {
        partyName: partyName.trim(),
        srNo: srNo,
        quotationDate: state.quotation.quotationDate,
        orderSettings: orderSettings,
        lineItems: state.quotation.lineItems,
        totals: state.quotation.totals,
        termsAndConditions: state.quotation.termsAndConditions,
        status: 'saved'
      };

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (response.ok) {
        const savedQuotation = await response.json();
        actions.updateQuotationHeader({ 
          id: savedQuotation.id, 
          status: 'saved' 
        });
        alert('Quotation saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error saving quotation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSrNoEdit = () => {
    setTempSrNo(srNo);
    setIsEditingSrNo(true);
  };

  const handleSrNoSave = () => {
    if (tempSrNo.trim()) {
      actions.updateQuotationHeader({ srNo: tempSrNo.trim() });
      setIsEditingSrNo(false);
    }
  };

  const handleSrNoCancel = () => {
    setTempSrNo('');
    setIsEditingSrNo(false);
  };

  const handleSupplyTypeChange = (supplyType) => {
    actions.updateOrderSettings({ supplyType });
  };

  const handleGodownChange = (godown) => {
    actions.updateOrderSettings({ godown });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Order Settings</h2>
            <p className="text-sm text-gray-600">Configure supply type and basic parameters</p>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSaveQuotation}
          disabled={isSaving || !partyName.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Quotation'}</span>
        </button>
      </div>

      {/* SR Number, Party Name and Quotation Date Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* SR Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quotation SR Number
          </label>
          <div className="flex items-center space-x-2">
            {isEditingSrNo ? (
              <>
                <input
                  type="text"
                  value={tempSrNo}
                  onChange={(e) => setTempSrNo(e.target.value.toUpperCase())}
                  placeholder="e.g., DEC001"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={handleSrNoSave}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSrNoCancel}
                  className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-lg font-bold text-blue-600 shadow-sm">
                  {srNo || 'Generating...'}
                </div>
                <button
                  onClick={handleSrNoEdit}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                  title="Edit SR Number (for backdating)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated or edit for backdating
          </p>
        </div>

        {/* Party Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Party Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={partyName}
            onChange={(e) => actions.updateQuotationHeader({ partyName: e.target.value })}
            placeholder="Enter customer/party name"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Quotation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quotation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={quotationDate ? new Date(quotationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            onChange={(e) => actions.updateQuotationHeader({ quotationDate: new Date(e.target.value) })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            Date for this quotation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply Type */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Supply Type
          </label>
          <div className="space-y-3">
            {Object.entries(SUPPLY_TYPES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleSupplyTypeChange(label)}
                className={clsx(
                  'w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all',
                  orderSettings.supplyType === label
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                <div className={clsx(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  orderSettings.supplyType === label
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400'
                )}>
                  {orderSettings.supplyType === label && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                {label === SUPPLY_TYPES.GODOWN ? (
                  <Warehouse className="w-5 h-5" />
                ) : (
                  <Truck className="w-5 h-5" />
                )}
                <div className="text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs opacity-75">
                    {label === SUPPLY_TYPES.GODOWN 
                      ? 'Stock from godown (rates editable)'
                      : 'Direct delivery from Jindal'
                    }
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Godown Selection (only if From Godown is selected) */}
        {orderSettings.supplyType === SUPPLY_TYPES.GODOWN && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Godown Location
            </label>
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 shadow-sm">
              Wagholi
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Stock location for rate calculation
            </p>
          </div>
        )}

        {/* GST Percentage - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST %
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">18% (Fixed)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            GST is fixed at 18% and cannot be changed
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Factory className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">Current Configuration:</span>
            <span className="ml-2">
              {orderSettings.supplyType}
              {orderSettings.supplyType === SUPPLY_TYPES.GODOWN && (
                <span> from {orderSettings.godown}</span>
              )}
              Supply: {orderSettings.supplyType}, Godown: {orderSettings.godown}, GST: {orderSettings.gst}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSettings;