'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Upload, 
  Download, 
  AlertCircle,
  CheckCircle,
  Settings2,
  Database,
  Percent,
  Truck,
  IndianRupee
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { DEFAULT_SETTINGS } from '../../data/constants.js';
import { SAMPLE_PRICE_LIST } from '../../data/priceList.js';

const Settings = () => {
  const { state, actions } = useApp();
  const [localSettings, setLocalSettings] = useState(state.settings || DEFAULT_SETTINGS);
  const [localPriceList, setLocalPriceList] = useState(state.priceList || {});
  const [activeSection, setActiveSection] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');

  // Update local state when global state changes
  useEffect(() => {
    setLocalSettings(state.settings || DEFAULT_SETTINGS);
    setLocalPriceList(state.priceList || {});
  }, [state.settings, state.priceList]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    actions.updateSettings(localSettings);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleResetSettings = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    actions.updateSettings(DEFAULT_SETTINGS);
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handlePriceListImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setLocalPriceList(importedData);
          actions.updatePriceList(importedData);
          setSaveStatus('imported');
          setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePriceListExport = () => {
    const dataStr = JSON.stringify(localPriceList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price_list.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetPriceList = () => {
    setLocalPriceList(SAMPLE_PRICE_LIST);
    actions.updatePriceList(SAMPLE_PRICE_LIST);
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const sections = [
    { id: 'general', name: 'General Settings', icon: Settings2 },
    { id: 'pricing', name: 'Pricing Settings', icon: IndianRupee },
    { id: 'freight', name: 'Freight Settings', icon: Truck },
    { id: 'pricelist', name: 'Price List', icon: Database },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Percent className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">GST Rate: 18% (Fixed)</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">GST is fixed at 18% and cannot be changed</p>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Profit % (for Bulk Jindal)
        </label>
        <div className="relative">
          <input
            type="number"
            value={localSettings.profitPercentage}
            onChange={(e) => handleSettingChange('profitPercentage', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="20"
            step="0.1"
          />
          <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Profit margin for direct Jindal supply</p>
      </div>
    </div>
  );

  const renderFreightSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dead Freight Rate per Ton
        </label>
        <div className="relative">
          <input
            type="number"
            value={localSettings.deadFreightRate}
            onChange={(e) => handleSettingChange('deadFreightRate', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-8"
            min="0"
            step="50"
          />
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Rate per ton for dead freight calculation</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Capacities (Tons)
        </label>
        <div className="flex space-x-2">
          {localSettings.vehicleCapacities.map((capacity, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="number"
                value={capacity}
                onChange={(e) => {
                  const newCapacities = [...localSettings.vehicleCapacities];
                  newCapacities[index] = parseFloat(e.target.value) || 0;
                  handleSettingChange('vehicleCapacities', newCapacities);
                }}
                className="w-20 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                step="1"
              />
              <span className="text-sm text-gray-500">T</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Available vehicle capacities for freight calculation</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Vehicle Capacity
        </label>
        <select
          value={localSettings.defaultVehicleCapacity}
          onChange={(e) => handleSettingChange('defaultVehicleCapacity', parseFloat(e.target.value))}
          className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {localSettings.vehicleCapacities.map(capacity => (
            <option key={capacity} value={capacity}>{capacity} Tons</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderPriceListSettings = () => (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          onClick={() => document.getElementById('priceListImport').click()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          <span>Import Price List</span>
        </button>
        
        <button
          onClick={handlePriceListExport}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Price List</span>
        </button>
        
        <button
          onClick={resetPriceList}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Default</span>
        </button>
      </div>

      <input
        type="file"
        id="priceListImport"
        accept=".json"
        onChange={handlePriceListImport}
        className="hidden"
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Current Price List Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(localPriceList || {}).map(([material, sizes]) => (
            <div key={material} className="bg-white rounded-lg p-3 border">
              <h5 className="font-medium text-gray-800">{material} Pipes</h5>
              <p className="text-sm text-gray-600">
                {Object.keys(sizes || {}).length} sizes configured
              </p>
              <p className="text-xs text-gray-500">
                {Object.keys(sizes || {}).length > 0 ? (
                  <>Size range: {Math.min(...Object.keys(sizes).map(Number))} - {Math.max(...Object.keys(sizes).map(Number))} NB</>
                ) : (
                  'No sizes configured'
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-medium mb-2">Price List Format:</p>
        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`{
  "MS": {
    "15": { "wtPerMtr": 0.68, "wagholiRate": 120, "puneRate": 115 },
    "20": { "wtPerMtr": 0.89, "wagholiRate": 118, "puneRate": 113 }
  }
}`}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure application defaults and price lists</p>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <div className={`mb-6 flex items-center space-x-2 p-4 rounded-lg ${
          saveStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          saveStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {saveStatus === 'success' && <CheckCircle className="w-5 h-5" />}
          {saveStatus === 'error' && <AlertCircle className="w-5 h-5" />}
          {(saveStatus === 'reset' || saveStatus === 'imported') && <CheckCircle className="w-5 h-5" />}
          <span>
            {saveStatus === 'success' && 'Settings saved successfully'}
            {saveStatus === 'error' && 'Error importing price list'}
            {saveStatus === 'reset' && 'Settings reset to defaults'}
            {saveStatus === 'imported' && 'Price list imported successfully'}
          </span>
        </div>
      )}

      <div className="flex space-x-8">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-64 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {sections.find(s => s.id === activeSection)?.name}
            </h2>

            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'pricing' && renderPricingSettings()}
            {activeSection === 'freight' && renderFreightSettings()}
            {activeSection === 'pricelist' && renderPriceListSettings()}

            {/* Save/Reset Buttons */}
            {activeSection !== 'pricelist' && (
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                
                <button
                  onClick={handleResetSettings}
                  className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Defaults</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;