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
  X,
  Settings
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
  GODOWNS,
  HEADING_TEMPLATES
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
  const [selectedHeadingTemplate, setSelectedHeadingTemplate] = useState('');
  const [availableSizes, setAvailableSizes] = useState(PIPE_SIZES);

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

  // Sync discountMode state with formData
  useEffect(() => {
    if (formData.discountMode !== discountMode) {
      setDiscountMode(formData.discountMode);
    }
  }, [formData.discountMode]);

  // Sync formData when editing an item
  useEffect(() => {
    if (editingId && lineItems.length > 0) {
      const item = lineItems.find(item => item.id === editingId);
      if (item) {
        setDiscountMode(item.discountMode || 'hide');
      }
    }
  }, [editingId, lineItems]);

  // Handle heading template selection
  const handleHeadingTemplateSelect = (templateId) => {
    if (!templateId) {
      setSelectedHeadingTemplate('');
      setAvailableSizes(PIPE_SIZES);
      return;
    }

    const template = HEADING_TEMPLATES[templateId];
    if (template) {
      setSelectedHeadingTemplate(templateId);
      setAvailableSizes(template.availableSizes);
      
      // Check if heading for this template already exists
      const headingExists = lineItems.some(item => 
        item.itemType === 'heading' && item.headingText === template.text
      );

      // If no heading exists, create one automatically
      if (!headingExists) {
        const headingItem = {
          id: Date.now(),
          itemType: 'heading',
          headingText: template.text,
          templateId: templateId, // Store template ID for easy reference
          material: template.material,
          make: template.make,
          pipeClass: template.pipeClass || CLASSES.MEDIUM,
          sizes: template.availableSizes,
        };
        actions.addLineItem(headingItem);
      }

      // Set form data for sub-item creation
      setFormData(prev => ({
        ...prev,
        itemType: 'sub-item',
        material: template.material,
        make: template.make,
        pipeClass: template.pipeClass || CLASSES.MEDIUM,
        sizes: template.availableSizes.length > 0 ? [template.availableSizes[0]] : [50],
      }));

      // Template selection always shows the size form - no need for showAddForm
      // The size selection will be visible immediately after template selection
    }
  };

  // Reset available sizes when no template is selected
  useEffect(() => {
    if (!selectedHeadingTemplate) {
      setAvailableSizes(PIPE_SIZES);
    }
  }, []); // Remove dependency on selectedHeadingTemplate to prevent reset loop

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
    // Validate required fields - now only for sub-items
    if (formData.sizes.length === 0) return;
    if (!selectedHeadingTemplate) return;
    
    const newItem = { ...formData, id: Date.now() };
    actions.addLineItem(newItem);
    setFormData(prev => ({
      ...getInitialFormData(),
      // Keep the template-related fields so user can add more sizes
      itemType: 'sub-item',
      material: prev.material,
      make: prev.make,
      pipeClass: prev.pipeClass,
      sizes: availableSizes.length > 0 ? [availableSizes[0]] : [50], // Reset to first available size
    }));
    setDiscountMode('hide'); // Reset discount mode
    // Don't close the form - keep it open for adding more sizes
    updateTotals([...lineItems, newItem]);
  };

  const handleAddMultipleSubItems = () => {
    if (!selectedHeadingTemplate) {
      alert('Please select a template to add multiple sub-items');
      return;
    }

    const template = HEADING_TEMPLATES[selectedHeadingTemplate];
    if (!template || !template.sizes.length) {
      alert('No sizes available for this template');
      return;
    }

    const newItems = template.sizes.map((size, index) => ({
      ...formData,
      id: Date.now() + index,
      sizes: [size],
      itemType: 'sub-item'
    }));

    // Add all items at once
    newItems.forEach(item => {
      actions.addLineItem(item);
    });

    setFormData(prev => ({
      ...getInitialFormData(),
      // Keep the template-related fields so user can add more sizes
      itemType: 'sub-item',
      material: prev.material,
      make: prev.make,
      pipeClass: prev.pipeClass,
      sizes: availableSizes.length > 0 ? [availableSizes[0]] : [50], // Reset to first available size
    }));
    setDiscountMode('hide'); // Reset discount mode
    // Don't close the form - keep it open for adding more sizes
    updateTotals([...lineItems, ...newItems]);
  };

  const handleEditItem = (id) => {
    const item = lineItems.find(item => item.id === id);
    if (item) {
      setFormData(item);
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  // Open the Add Sizes form prefilled from a heading (template) row
  const handleOpenAddSizesFromHeading = (headingItem) => {
    if (!headingItem) return;

    // Try to resolve a template id from the heading if present
    let templateId = headingItem.templateId;
    if (!templateId) {
      templateId = Object.keys(HEADING_TEMPLATES).find(key => {
        const t = HEADING_TEMPLATES[key];
        return t && t.text && headingItem.headingText && t.text === headingItem.headingText;
      });
    }

    // Set selected template (may be empty string if unknown)
    setSelectedHeadingTemplate(templateId || '');

    // Set available sizes from heading or template
    const sizesFromHeading = headingItem.sizes && headingItem.sizes.length ? headingItem.sizes : (
      (HEADING_TEMPLATES[templateId] && HEADING_TEMPLATES[templateId].availableSizes) || PIPE_SIZES
    );
    setAvailableSizes(sizesFromHeading);

    // Prefill the form for adding a sub-item (material/make/class come from heading)
    setFormData(prev => ({
      ...getInitialFormData(),
      material: headingItem.material || MATERIALS.MS,
      make: headingItem.make || prev.make,
      pipeClass: headingItem.pipeClass || prev.pipeClass,
      sizes: sizesFromHeading && sizesFromHeading.length ? [sizesFromHeading[0]] : [PIPE_SIZES[0]],
    }));

    // Show the add form so user can immediately add sizes
    setShowAddForm(true);
    
    // Scroll to top to show the template selection area
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleUpdateItem = () => {
    actions.updateLineItem(editingId, formData);
    setEditingId(null);
    setShowAddForm(false);
    setDiscountMode('hide'); // Reset discount mode
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

      <div className="grid grid-cols-1 gap-4">
        {/* Template Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Item Category (sets material, make, sizes)
          </label>
          <select
            value={selectedHeadingTemplate}
            onChange={(e) => handleHeadingTemplateSelect(e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a template...</option>
            <option value="MS_B_IS1239">MS ERW PIPE B CLASS AS PER IS1239 MAKE JINDAL (15-150 NB)</option>
            <option value="MS_B_IS3589">MS ERW PIPE B CLASS AS PER IS3589 MAKE JINDAL (200-600 NB)</option>
            <option value="MS_C_IS1239">MS ERW PIPE C CLASS AS PER IS1239 MAKE JINDAL (15-150 NB)</option>
            <option value="MS_C_IS3589">MS ERW PIPE C CLASS AS PER IS3589 MAKE JINDAL (200-600 NB)</option>
            <option value="GI_B_IS1239">GI PIPE B CLASS IS1239 SWS MAKE JINDAL (15-150 NB)</option>
            <option value="GI_C_PE">GI PIPE C CLASS P/E MAKE JINDAL (15-150 NB)</option>
            <option value="SEAMLESS_SA106">CS SEAMLESS PIPE AS PER SA106 GRADE B MAKE MSL/KFIL (All sizes)</option>
          </select>
        </div>
      </div>

      {/* Size Selection Section - Prominently displayed when template is selected */}
      {selectedHeadingTemplate && (
        <>
          {/* Visual separator and instruction */}
          <div className="border-t border-gray-200 my-6 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                ✓ Template Selected: {HEADING_TEMPLATES[selectedHeadingTemplate]?.text.split(' ').slice(0, 6).join(' ')}...
              </h4>
              <p className="text-sm text-blue-700">Now select size and quantity to add items:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size (NB)</label>
          <select
            value={formData.sizes[0]}
            onChange={(e) => setFormData(prev => ({ ...prev, sizes: [parseInt(e.target.value)] }))}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableSizes.map(size => (
              <option key={size} value={size}>{size} NB</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Available sizes based on selected template
          </div>
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
      </>
      )}

      {/* Second row with calculations and rates - Only when template is selected */}
      {selectedHeadingTemplate && (
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
            setDiscountMode('hide'); // Reset discount mode
          }}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        
        {/* Add buttons - only show when template is selected */}
        {selectedHeadingTemplate && (
          <>
            <button
              onClick={handleAddMultipleSubItems}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Sizes</span>
            </button>
            
            <button
              onClick={editingId ? handleUpdateItem : handleAddItem}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Size</span>
            </button>
          </>
        )}
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
      </div>

      {/* Template Selection - Always Visible */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Item Category (sets material, make, sizes)
          </label>
          <select
            value={selectedHeadingTemplate}
            onChange={(e) => handleHeadingTemplateSelect(e.target.value)}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a template...</option>
            <option value="MS_B_IS1239">MS ERW PIPE B CLASS AS PER IS1239 MAKE JINDAL (15-150 NB)</option>
            <option value="MS_B_IS3589">MS ERW PIPE B CLASS AS PER IS3589 MAKE JINDAL (200-600 NB)</option>
            <option value="MS_C_IS1239">MS ERW PIPE C CLASS AS PER IS1239 MAKE JINDAL (15-150 NB)</option>
            <option value="MS_C_IS3589">MS ERW PIPE C CLASS AS PER IS3589 MAKE JINDAL (200-600 NB)</option>
            <option value="GI_B_IS1239">GI PIPE B CLASS IS1239 SWS MAKE JINDAL (15-150 NB)</option>
            <option value="GI_C_PE">GI PIPE C CLASS P/E MAKE JINDAL (15-150 NB)</option>
            <option value="SEAMLESS_SA106">CS SEAMLESS PIPE AS PER SA106 GRADE B MAKE MSL/KFIL (All sizes)</option>
          </select>
          
          {/* spacer/helper text */}
          <div className="text-xs text-gray-500 mt-1">
            Select a template to enable size/quantity inputs below.
          </div>
        </div>

        {/* Size Selection - Shows immediately after template selection */}
        {selectedHeadingTemplate && selectedHeadingTemplate.length > 0 && (
          <div>
            {/* Success message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                ✓ Template Selected: {HEADING_TEMPLATES[selectedHeadingTemplate]?.text || selectedHeadingTemplate}
              </h4>
              <p className="text-sm text-green-700">Now select size and quantity to add items:</p>
            </div>

            {/* Size and Quantity Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (NB)</label>
                <select
                  value={formData.sizes[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, sizes: [parseInt(e.target.value)] }))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableSizes.map(size => (
                    <option key={size} value={size}>{size} NB</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Available sizes based on selected template
                </div>
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

            {/* Pricing Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Base Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate</label>
                <input
                  type="number"
                  value={formData.baseRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter rate"
                  readOnly={orderSettings.supplyType === SUPPLY_TYPES.GODOWN}
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                <input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter discount %"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={editingId ? handleUpdateItem : handleAddItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add This Size</span>
              </button>
              
              <button
                onClick={handleAddMultipleSubItems}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Multiple Sizes</span>
              </button>

              <button
                onClick={() => {
                  setSelectedHeadingTemplate('');
                  setFormData(getInitialFormData());
                  setShowAddForm(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Done Adding</span>
              </button>
            </div>
          </div>
        )}
      </div>

      
      {/* Line Items Table */}
      {lineItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Table className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No items added yet</p>
          <p className="text-sm text-gray-400">Click "Select Template" above to choose a pipe type and start adding sizes</p>
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
                            onClick={() => handleOpenAddSizesFromHeading(item)}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                            title="Add Sizes for this heading"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Sizes</span>
                          </button>
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