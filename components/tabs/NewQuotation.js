'use client';

import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES } from '../../data/constants.js';
import OrderSettings from '../forms/OrderSettings.js';
import LineItemsTable from '../tables/LineItemsTable.js';
import BulkCalculator from '../forms/BulkCalculator.js';

const NewQuotation = () => {
  const { state, actions } = useApp();
  const { orderSettings, lineItems, totals } = state.quotation;

  const handlePreviewClick = () => {
    actions.setActiveTab('preview-export');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
            <p className="text-gray-600 mt-2">Create a new pipe rate calculation and quotation</p>
          </div>
          
          <button
            onClick={handlePreviewClick}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={lineItems.length === 0}
          >
            <span>Preview & Export</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Order Settings Panel */}
        <OrderSettings />

        {/* Bulk Calculator (only show for Direct Jindal) */}
        {orderSettings.supplyType === SUPPLY_TYPES.DIRECT && (
          <BulkCalculator />
        )}

        {/* Line Items Table */}
        <LineItemsTable />

        {/* Summary Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Quotation Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{lineItems.length}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-semibold text-gray-900">{totals.totalQty.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Mtrs</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Weight</p>
              <p className="text-2xl font-semibold text-gray-900">{totals.totalWeight.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Kgs</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totals.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Including GST</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => actions.resetQuotation()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Quotation
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handlePreviewClick}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={lineItems.length === 0}
            >
              <span>Preview & Export</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuotation;