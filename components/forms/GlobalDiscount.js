'use client';

import React from 'react';
import { Percent } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { clsx } from 'clsx';

const GlobalDiscount = () => {
  const { state, actions } = useApp();
  const { orderSettings } = state.quotation;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Percent className="w-4 h-4 text-yellow-600" />
        <h3 className="text-sm font-medium text-yellow-800">Global Discount</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Percentage
          </label>
          <input
            type="number"
            value={orderSettings.globalDiscount || 0}
            onChange={(e) => actions.updateOrderSettings({ globalDiscount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="0"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Mode
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => actions.updateOrderSettings({ discountMode: 'show' })}
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium border-2 transition-all',
                (orderSettings.discountMode || 'show') === 'show'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              )}
            >
              Show in T&C
            </button>
            <button
              onClick={() => actions.updateOrderSettings({ discountMode: 'hide' })}
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium border-2 transition-all',
                orderSettings.discountMode === 'hide'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              )}
            >
              Apply to Price
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        This discount will apply to all items in the quotation. Choose "Show in T&C" to display discount separately or "Apply to Price" to include in item rates.
      </p>
    </div>
  );
};

export default GlobalDiscount;