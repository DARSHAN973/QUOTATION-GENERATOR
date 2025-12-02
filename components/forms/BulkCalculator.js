'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Truck, 
  RefreshCw,
  CheckSquare,
  AlertCircle,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES } from '../../data/constants.js';
import { calculateBulkRates, roundTo } from '../../utils/calculations.js';
import { clsx } from 'clsx';

const BulkCalculator = () => {
  const { state, actions } = useApp();
  const { bulkCalculation, lineItems, orderSettings } = state.quotation;
  const { settings } = state;
  
  const [localBulk, setLocalBulk] = useState(bulkCalculation);
  const [bulkResults, setBulkResults] = useState(null);

  // Calculate total order tons from line items
  const calculateTotalTons = () => {
    return lineItems.reduce((total, item) => total + item.totalKg, 0) / 1000;
  };

  // Calculate total meters from line items
  const calculateTotalMeters = () => {
    return lineItems.reduce((total, item) => total + item.totalMeters, 0);
  };

  // Update bulk calculation when line items change or form values change
  useEffect(() => {
    const totalTons = calculateTotalTons();
    const totalMeters = calculateTotalMeters();
    
    if (totalTons > 0 && totalMeters > 0) {
      const results = calculateBulkRates(
        totalTons,
        localBulk.vehicleCapacity,
        localBulk.deadFreightRate,
        localBulk.baseRate,
        localBulk.profitPercentage,
        totalMeters
      );
      setBulkResults(results);
    }
  }, [
    lineItems,
    localBulk.vehicleCapacity,
    localBulk.deadFreightRate,
    localBulk.baseRate,
    localBulk.profitPercentage
  ]);

  // Update global state when local values change
  useEffect(() => {
    actions.updateBulkCalculation(localBulk);
  }, [localBulk]);

  const handleInputChange = (field, value) => {
    setLocalBulk(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyBulkRate = () => {
    if (!bulkResults) return;
    
    // Apply the calculated bulk rate to all line items
    lineItems.forEach(item => {
      actions.updateLineItem(item.id, {
        baseRate: roundTo(bulkResults.finalBulkRate, 2),
        finalRate: roundTo(
          bulkResults.finalBulkRate * (1 - item.discountPercent / 100), 2
        ),
        lineAmount: roundTo(
          (item.rateBasis === 'Per Mtr' ? item.totalMeters : item.totalKg) *
          bulkResults.finalBulkRate * (1 - item.discountPercent / 100), 2
        )
      });
    });

    setLocalBulk(prev => ({ ...prev, applyToAll: true }));
  };

  const handleResetRates = () => {
    setLocalBulk(prev => ({ ...prev, applyToAll: false }));
  };

  const totalTons = calculateTotalTons();
  const totalMeters = calculateTotalMeters();

  // Don't show if not Direct Jindal supply
  if (orderSettings.supplyType !== SUPPLY_TYPES.DIRECT) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Truck className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Calculator (Direct Jindal)</h2>
          <p className="text-sm text-gray-600">Dead freight and bulk rate calculation</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Order Weight</p>
          <p className="text-2xl font-semibold text-gray-900">{totalTons.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Tons</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Meters</p>
          <p className="text-2xl font-semibold text-gray-900">{totalMeters.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Mtrs</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Line Items</p>
          <p className="text-2xl font-semibold text-gray-900">{lineItems.length}</p>
          <p className="text-xs text-gray-500">Items</p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Capacity (Tons)
          </label>
          <select
            value={localBulk.vehicleCapacity}
            onChange={(e) => handleInputChange('vehicleCapacity', parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
          >
            {settings.vehicleCapacities.map(capacity => (
              <option key={capacity} value={capacity}>{capacity} Tons</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dead Freight Rate (/Ton)
          </label>
          <input
            type="number"
            value={localBulk.deadFreightRate}
            onChange={(e) => handleInputChange('deadFreightRate', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
            min="0"
            step="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Rate from Jindal (/Mtr)
          </label>
          <input
            type="number"
            value={localBulk.baseRate}
            onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Profit %
          </label>
          <input
            type="number"
            value={localBulk.profitPercentage}
            onChange={(e) => handleInputChange('profitPercentage', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
            min="0"
            max="20"
            step="0.1"
          />
        </div>
      </div>

      {/* Calculations Results */}
      {bulkResults && totalTons > 0 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Calculation Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Vehicles Needed:</span>
                  <span className="font-medium text-blue-900">{bulkResults.vehiclesNeeded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Capacity:</span>
                  <span className="font-medium text-blue-900">{bulkResults.totalCapacity.toFixed(2)} Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Dead Weight:</span>
                  <span className="font-medium text-blue-900">{bulkResults.deadTon.toFixed(2)} Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Dead Freight Total:</span>
                  <span className="font-medium text-blue-900">₹{bulkResults.deadFreightTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Base Rate + Profit:</span>
                  <span className="font-medium text-blue-900">₹{bulkResults.baseRateWithProfit.toFixed(2)}/Mtr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Dead Freight /Mtr:</span>
                  <span className="font-medium text-blue-900">₹{bulkResults.deadFreightPerMtr.toFixed(2)}/Mtr</span>
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2">
                  <span className="text-sm font-semibold text-blue-700">Final Bulk Rate:</span>
                  <span className="font-bold text-blue-900 text-lg">₹{bulkResults.finalBulkRate.toFixed(2)}/Mtr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Rate Actions */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Apply Bulk Rate to All Items</p>
                <p className="text-sm text-yellow-700">This will update the base rate for all line items</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {localBulk.applyToAll ? (
                <button
                  onClick={handleResetRates}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Rates</span>
                </button>
              ) : (
                <button
                  onClick={handleApplyBulkRate}
                  className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  disabled={lineItems.length === 0}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Apply to All Items</span>
                </button>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <Info className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Vehicles needed = ⌈Order Tons ÷ Vehicle Capacity⌉</li>
                <li>• Dead weight = (Total capacity - Order weight)</li>
                <li>• Dead freight = Dead weight × Dead freight rate</li>
                <li>• Dead freight per meter = Dead freight ÷ Total meters</li>
                <li>• Final rate = (Base rate + Profit%) + Dead freight per meter</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warning if no items */}
      {lineItems.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-orange-300 rounded-lg">
          <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <p className="text-orange-600 font-medium">No line items found</p>
          <p className="text-sm text-orange-500">Add some pipe items to enable bulk calculation</p>
        </div>
      )}
    </div>
  );
};

export default BulkCalculator;