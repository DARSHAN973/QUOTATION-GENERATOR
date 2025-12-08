'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Table, 
  Trash2, 
  AlertTriangle,
  Calculator,
  Edit,
  Save,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext.js';
import { 
  MATERIALS, 
  CLASSES, 
  SCHEDULES, 
  PIPE_SIZES, 
  LENGTH_MODES, 
  RATE_BASIS, 
  DEFAULT_PIPE_LENGTH,
  SUPPLY_TYPES,
  GODOWNS 
} from '../../data/constants.js';
import { getPriceListData } from '../../data/priceList.js';
import {
  calculateMetersFromPipes,
  calculateKgFromMeters,
  calculateMetersFromKg,
  calculateRatePerKg,
  calculateRatePerMtr,
  applyDiscount,
  calculateLineAmount,
  roundTo
} from '../../utils/calculations.js';

const LineItemsTable = () => {
  const { state, actions } = useApp();
  const { lineItems, orderSettings } = state.quotation;
  const { priceList } = state;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [discountMode, setDiscountMode] = useState('hide'); // 'show' = in T&C, 'hide' = apply to price
  const [formData, setFormData] = useState(getInitialFormData());

  function getInitialFormData() {
    return {
      id: Date.now(),
      itemType: 'sub-item', // 'heading' or 'sub-item'
      headingText: '', // For heading items
      material: MATERIALS.MS,
      make: 'Jindal', // Auto-set based on material
      pipeClass: CLASSES.MEDIUM,
      thickness: '', // For pipes 200NB and above
      sizes: [50],
      schedule: 'SCH-40',
      lengthMode: LENGTH_MODES.PIPES,
      pipeCount: 100,
      totalMeters: 0,
      totalKg: 0,
      wtPerMtr: 0,
      rateBasis: RATE_BASIS.PER_MTR,
      baseRate: 0,
      discountPercent: 0,
      discountMode: 'hide', // 'show' = show in T&C, 'hide' = apply to price directly
      finalRate: 0,
      lineAmount: 0,
    };
  }

  // Auto-set make based on material
  const autoSetMake = (material) => {
    if (material === MATERIALS.SEAMLESS) {
      return 'MSL/KFIL';
    } else {
      return 'Jindal'; // For MS and GI
    }
  };

  // Update make when material changes
  useEffect(() => {
    const newMake = autoSetMake(formData.material);
    if (formData.make !== newMake) {
      setFormData(prev => ({ ...prev, make: newMake }));
    }
  }, [formData.material]);

  // Calculate derived values when form data changes
  useEffect(() => {
    calculateDerivedValues();
  }, [
    formData.material,
    formData.sizes,
    formData.lengthMode,
    formData.pipeCount,
    formData.totalMeters,
    formData.totalKg,
    formData.rateBasis,
    formData.baseRate,
    formData.discountPercent,
    formData.discountMode
  ]);

  const calculateDerivedValues = () => {
    // Get weight per meter from price list based on plant, material, and class
    let pipeClass = 'MEDIUM';
    if (formData.material !== MATERIALS.SEAMLESS) {
      pipeClass = formData.pipeClass === CLASSES.HEAVY ? 'HEAVY' : 'MEDIUM';
    }
    
    const priceData = getPriceListData(orderSettings.plant, formData.material, pipeClass, formData.sizes[0]);
    const wtPerMtr = priceData?.wtPerMtr || 0;

    // Calculate meters and kg based on input mode
    let totalMeters = 0;
    let totalKg = 0;

    switch (formData.lengthMode) {
      case LENGTH_MODES.PIPES:
        totalMeters = calculateMetersFromPipes(formData.pipeCount, DEFAULT_PIPE_LENGTH);
        totalKg = calculateKgFromMeters(totalMeters, wtPerMtr);
        break;
      case LENGTH_MODES.METERS:
        totalMeters = formData.totalMeters;
        totalKg = calculateKgFromMeters(totalMeters, wtPerMtr);
        break;
      case LENGTH_MODES.KGS:
        totalKg = formData.totalKg;
        totalMeters = calculateMetersFromKg(totalKg, wtPerMtr);
        break;
    }

    // Calculate base rate from price list
    let baseRate = 0;
    if (orderSettings.supplyType === SUPPLY_TYPES.GODOWN && priceData) {
      if (orderSettings.godown === GODOWNS.WAGHOLI) {
        baseRate = priceData.wagholiRate || 0;
      } else {
        baseRate = priceData.puneRate || 0;
      }
    } else {
      baseRate = formData.baseRate; // For bulk Jindal, this will be set manually
    }

    // Convert rate based on rate basis
    let displayRate = baseRate;
    if (formData.rateBasis === RATE_BASIS.PER_KG) {
      displayRate = calculateRatePerKg(baseRate, wtPerMtr);
    }

    // Apply discount only if discountMode is 'hide' (apply to price)
    const finalRate = formData.discountMode === 'hide' ? 
      applyDiscount(displayRate, formData.discountPercent) : 
      displayRate;

    // Calculate line amount
    const quantity = formData.rateBasis === RATE_BASIS.PER_MTR ? totalMeters : totalKg;
    const lineAmount = calculateLineAmount(quantity, finalRate);

    setFormData(prev => ({
      ...prev,
      wtPerMtr,
      totalMeters: roundTo(totalMeters, 2),
      totalKg: roundTo(totalKg, 2),
      baseRate: roundTo(displayRate, 2),
      finalRate: roundTo(finalRate, 2),
      lineAmount: roundTo(lineAmount, 2)
    }));
  };

  const handleAddItem = () => {
    // For sub-items, validate sizes; for headings, validate heading text
    if (formData.itemType === 'sub-item' && formData.sizes.length === 0) return;
    if (formData.itemType === 'heading' && !formData.headingText.trim()) return;
    
    const newItem = { ...formData, id: Date.now() };
    actions.addLineItem(newItem);
    setFormData(getInitialFormData());
    setShowAddForm(false);
    updateTotals([...lineItems, newItem]);
  };

  const handleEditItem = (id) => {
    const item = lineItems.find(item => item.id === id);
    if (item) {
      setFormData(item);
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateItem = () => {
    actions.updateLineItem(editingId, formData);
    setEditingId(null);
    setShowAddForm(false);
    const updatedItems = lineItems.map(item => 
      item.id === editingId ? { ...item, ...formData } : item
    );
    updateTotals(updatedItems);
  };

  const handleDeleteItem = (id) => {
    actions.removeLineItem(id);
    const remainingItems = lineItems.filter(item => item.id !== id);
    updateTotals(remainingItems);
  };

  const updateTotals = (items) => {
    // Only calculate totals for sub-items, not heading items
    const totals = items.reduce((acc, item) => {
      if (item.itemType !== 'heading') {
        acc.totalQty += item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg;
        acc.totalWeight += item.totalKg;
        acc.netAmount += item.lineAmount;
      }
      return acc;
    }, { totalQty: 0, totalWeight: 0, netAmount: 0 });

    totals.gstAmount = totals.netAmount * (orderSettings.gst / 100);
    totals.totalAmount = totals.netAmount + totals.gstAmount;

    actions.updateTotals(totals);
  };

  const renderAddForm = () => (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingId ? 'Edit Item' : 'Add New Item'}
        </h3>
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingId(null);
            setFormData(getInitialFormData());
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Item Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
          <select
            value={formData.itemType}
            onChange={(e) => setFormData(prev => ({ ...prev, itemType: e.target.value }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="heading">Heading</option>
            <option value="sub-item">Sub Item</option>
          </select>
        </div>

        {/* Heading Text - Only for heading items */}
        {formData.itemType === 'heading' && (
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Text</label>
            <input
              type="text"
              value={formData.headingText}
              onChange={(e) => setFormData(prev => ({ ...prev, headingText: e.target.value }))}
              placeholder="e.g., MS ERW PIPE B CLASS AS PER IS1239 MAKE Jindal"
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Sub-item fields - Only for sub-items */}
      {formData.itemType === 'sub-item' && (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
          <select
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.values(MATERIALS).map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        {/* Make - Auto-set, read-only display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
          <input
            type="text"
            value={formData.make}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md cursor-not-allowed"
            title="Make is automatically set based on material"
          />
        </div>

        {/* Class/Type/Thickness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.material === MATERIALS.SEAMLESS ? 'Type' : 
             formData.sizes[0] >= 200 ? 'Thickness (THK)' : 'Class'}
          </label>
          {formData.material === MATERIALS.SEAMLESS ? (
            <select
              value={formData.schedule}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SCHEDULES.map(schedule => (
                <option key={schedule} value={schedule}>{schedule}</option>
              ))}
            </select>
          ) : formData.sizes[0] >= 200 ? (
            <input
              type="text"
              value={formData.thickness}
              onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5mm, 6mm, 8mm"
            />
          ) : (
            <select
              value={formData.pipeClass}
              onChange={(e) => setFormData(prev => ({ ...prev, pipeClass: e.target.value }))}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(CLASSES).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          )}
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size (NB)</label>
          <select
            value={formData.sizes[0]}
            onChange={(e) => setFormData(prev => ({ ...prev, sizes: [parseInt(e.target.value)] }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PIPE_SIZES.map(size => (
              <option key={size} value={size}>{size} NB</option>
            ))}
          </select>
        </div>

        {/* Quantity with Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={
                formData.lengthMode === LENGTH_MODES.PIPES ? formData.pipeCount :
                formData.lengthMode === LENGTH_MODES.METERS ? formData.totalMeters : formData.totalKg
              }
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (formData.lengthMode === LENGTH_MODES.PIPES) {
                  setFormData(prev => ({ ...prev, pipeCount: value }));
                } else if (formData.lengthMode === LENGTH_MODES.METERS) {
                  setFormData(prev => ({ ...prev, totalMeters: value }));
                } else {
                  setFormData(prev => ({ ...prev, totalKg: value }));
                }
              }}
              className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              placeholder="Enter quantity"
            />
            <select
              value={formData.lengthMode}
              onChange={(e) => setFormData(prev => ({ ...prev, lengthMode: e.target.value }))}
              className="w-28 px-2 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={LENGTH_MODES.PIPES}>Pipes</option>
              <option value={LENGTH_MODES.METERS}>Mtrs</option>
              <option value={LENGTH_MODES.KGS}>Kgs</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {/* Second row with calculations and rates - Only for sub-items */}
      {formData.itemType === 'sub-item' && (
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wt/Mtr</label>
          <input
            type="number"
            value={formData.wtPerMtr}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Mtrs</label>
          <input
            type="number"
            value={formData.totalMeters}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Kgs</label>
          <input
            type="number"
            value={formData.totalKg}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select
            value={formData.rateBasis}
            onChange={(e) => setFormData(prev => ({ ...prev, rateBasis: e.target.value }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.values(RATE_BASIS).map(basis => (
              <option key={basis} value={basis}>{basis}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price List</label>
          <input
            type="number"
            value={formData.baseRate}
            onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readOnly={orderSettings.supplyType === SUPPLY_TYPES.GODOWN}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Discount %</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setDiscountMode('show');
                  setFormData(prev => ({ ...prev, discountMode: 'show' }));
                }}
                className={`text-xs px-2 py-1 rounded ${discountMode === 'show' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                Show in T&C
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscountMode('hide');
                  setFormData(prev => ({ ...prev, discountMode: 'hide' }));
                }}
                className={`text-xs px-2 py-1 rounded ${discountMode === 'hide' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                Apply to Price
              </button>
            </div>
          </div>
          <input
            type="number"
            value={formData.discountPercent}
            onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="50"
            placeholder="Enter discount %"
          />
          <p className="text-xs text-gray-500 mt-1">
            {discountMode === 'show' ? 'Will show in Terms & Conditions' : 'Will be applied to final price'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Final Rate</label>
          <input
            type="number"
            value={formData.finalRate}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
          <input
            type="number"
            value={formData.lineAmount}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
          />
        </div>
      </div>
      )}

      {/* Add Item Button */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingId(null);
            setFormData(getInitialFormData());
          }}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={editingId ? handleUpdateItem : handleAddItem}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Save className="w-4 h-4" />
          <span>{editingId ? 'Update Item' : 'Add Item'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Table className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <p className="text-sm text-gray-600">Add pipe items and calculate rates</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && renderAddForm()}
      
      {/* Line Items Table */}
      {lineItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Table className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No items added yet</p>
          <p className="text-sm text-gray-400">Click "Add Item" to start building your quotation</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Material</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Size</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Price List</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Discount</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Final Rate</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Total Amount</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => {
                // Render heading items differently
                if (item.itemType === 'heading') {
                  return (
                    <tr key={item.id} className="border-b border-gray-200 bg-blue-50">
                      <td colSpan="7" className="px-4 py-3">
                        <div className="font-bold text-gray-900 text-lg">
                          {item.headingText || 'Heading Item'}
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                // Render sub-items normally
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{item.material}</div>
                        <div className="text-sm text-gray-500">
                          {item.material === MATERIALS.SEAMLESS ? item.schedule : 
                           item.sizes[0] >= 200 ? `THK: ${item.thickness}` : item.pipeClass}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{item.sizes.join(', ')} NB</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <div className="text-gray-900">
                          {(item.rateBasis === RATE_BASIS.PER_MTR ? item.totalMeters : item.totalKg).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.rateBasis === RATE_BASIS.PER_MTR ? 'Mtrs' : 'Kgs'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{item.baseRate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {item.discountPercent}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{item.finalRate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ₹{item.lineAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditItem(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ); // End of sub-item rendering
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LineItemsTable;