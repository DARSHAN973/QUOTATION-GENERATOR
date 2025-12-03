'use client';

import React from 'react';
import { FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SUPPLY_TYPES } from '../../data/constants.js';

const TermsAndConditions = () => {
  const { state, actions } = useApp();
  const { orderSettings, termsAndConditions } = state.quotation;

  const handleTermUpdate = (field, value) => {
    actions.updateTermsAndConditions({ [field]: value });
  };

  const ToggleButton = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className="flex items-center focus:outline-none"
      >
        {enabled ? (
          <ToggleRight className="w-8 h-8 text-green-500" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-gray-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
          <p className="text-sm text-gray-600">Configure quotation terms and conditions</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Payment Term */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Term
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={termsAndConditions.paymentTerm}
              onChange={(e) => handleTermUpdate('paymentTerm', e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="Against Delivery">Against Delivery</option>
              <option value="Within 15 Days">Within 15 Days</option>
              <option value="Within 30 Days">Within 30 Days</option>
              <option value="50% Advance - 50% Against Delivery">50% Advance - 50% Against Delivery</option>
              <option value="100% Advance">100% Advance</option>
              <option value="custom">Custom Payment Term</option>
            </select>

            {termsAndConditions.paymentTerm === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom payment term"
                value={termsAndConditions.customPaymentTerm}
                onChange={(e) => handleTermUpdate('customPaymentTerm', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Valid Till Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid Till Date
          </label>
          <input
            type="date"
            value={termsAndConditions.validTillDate}
            onChange={(e) => handleTermUpdate('validTillDate', e.target.value)}
            className="w-full max-w-xs px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Conditional Terms (only for Godown supply type) */}
        {orderSettings.supplyType === SUPPLY_TYPES.GODOWN && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Additional Terms</h3>
            
            <div className="space-y-2">
              <ToggleButton
                enabled={termsAndConditions.showTransportExtra}
                onChange={(value) => handleTermUpdate('showTransportExtra', value)}
                label="TRANSPORT EXTRA AT ACTUAL"
              />
              
              <ToggleButton
                enabled={termsAndConditions.showLoadingExtra}
                onChange={(value) => handleTermUpdate('showLoadingExtra', value)}
                label="LOADING EXTRA"
              />
              
              <ToggleButton
                enabled={termsAndConditions.showGodownLocation}
                onChange={(value) => handleTermUpdate('showGodownLocation', value)}
                label="PIPES RATES EX- WAGHOLI GODOWN"
              />
            </div>
          </div>
        )}

        {/* Fixed Terms Preview */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Fixed Terms (Always Included)</h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 space-y-1">
            <p>• +18% GST EXTRA (Fixed)</p>
            <p>• UNLOADING EXTRA IN YOUR ACCOUNT</p>
            <p>• IN CASE OF INCREASE IN STEEL PRICES ABOVE RATES WILL NOT BE VALID</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;