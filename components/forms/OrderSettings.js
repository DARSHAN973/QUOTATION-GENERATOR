'use client';

import React from 'react';
import { 
  Warehouse, 
  Factory, 
  Percent,
  RadioIcon,
  Building2,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES, GODOWNS, PLANTS } from '../../data/constants.js';
import { clsx } from 'clsx';

const OrderSettings = () => {
  const { state, actions } = useApp();
  const { orderSettings } = state.quotation;

  const handleSupplyTypeChange = (supplyType) => {
    actions.updateOrderSettings({ supplyType });
  };

  const handleGodownChange = (godown) => {
    actions.updateOrderSettings({ godown });
  };

  const handlePlantChange = (plant) => {
    actions.updateOrderSettings({ plant });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order Settings</h2>
          <p className="text-sm text-gray-600">Configure supply type and basic parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                      ? 'Stock from our godown'
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
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              Wagholi
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Stock location for rate calculation
            </p>
          </div>
        )}

        {/* Plant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plant (Reference)
          </label>
          <select
            value={orderSettings.plant}
            onChange={(e) => handlePlantChange(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            {PLANTS.map((plant) => (
              <option key={plant} value={plant}>
                {plant}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            For description reference only
          </p>
        </div>

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
              , Plant: {orderSettings.plant}, GST: {orderSettings.gst}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSettings;