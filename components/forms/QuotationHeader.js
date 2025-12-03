// QuotationHeader component for party name, SR NO, and date inputs

import React, { useState, useEffect } from 'react';
import { Calendar, User, Hash, Edit3, Check, X } from 'lucide-react';
import { generateSRNumber, validateSRNumber, formatQuotationDate, getCurrentDateFormatted, parseDateFromString } from '../../utils/quotationUtils.js';

const QuotationHeader = ({ 
  quotationData = {},
  onUpdate,
  existingQuotations = [],
  className = '' 
}) => {
  const [isEditingSRNo, setIsEditingSRNo] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempSRNo, setTempSRNo] = useState('');
  const [tempDate, setTempDate] = useState('');

  // Initialize with current data or defaults
  const partyName = quotationData.partyName || '';
  const srNo = quotationData.srNo || generateSRNumber(existingQuotations);
  const quotationDate = quotationData.quotationDate || new Date();

  useEffect(() => {
    // Auto-generate SR NO if not set
    if (!quotationData.srNo) {
      const newSRNo = generateSRNumber(existingQuotations);
      onUpdate({
        ...quotationData,
        srNo: newSRNo,
        quotationDate: quotationData.quotationDate || new Date()
      });
    }
  }, [existingQuotations]);

  const handlePartyNameChange = (e) => {
    onUpdate({
      ...quotationData,
      partyName: e.target.value
    });
  };

  const handleSRNoEdit = () => {
    setTempSRNo(srNo);
    setIsEditingSRNo(true);
  };

  const handleSRNoSave = () => {
    if (validateSRNumber(tempSRNo)) {
      onUpdate({
        ...quotationData,
        srNo: tempSRNo
      });
      setIsEditingSRNo(false);
    } else {
      alert('Invalid SR NO format. Please use format: ABC123 (3 letters + 3 digits)');
    }
  };

  const handleSRNoCancel = () => {
    setTempSRNo('');
    setIsEditingSRNo(false);
  };

  const handleDateEdit = () => {
    setTempDate(formatQuotationDate(quotationDate));
    setIsEditingDate(true);
  };

  const handleDateSave = () => {
    try {
      const parsedDate = parseDateFromString(tempDate);
      onUpdate({
        ...quotationData,
        quotationDate: parsedDate
      });
      setIsEditingDate(false);
    } catch (error) {
      alert('Invalid date format. Please use DD-MM-YYYY format.');
    }
  };

  const handleDateCancel = () => {
    setTempDate('');
    setIsEditingDate(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 mb-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quotation Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Party Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Party Name
          </label>
          <input
            type="text"
            value={partyName}
            onChange={handlePartyNameChange}
            placeholder="Enter party name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* SR Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="inline w-4 h-4 mr-1" />
            SR Number
          </label>
          <div className="flex items-center space-x-2">
            {isEditingSRNo ? (
              <>
                <input
                  type="text"
                  value={tempSRNo}
                  onChange={(e) => setTempSRNo(e.target.value.toUpperCase())}
                  placeholder="DEC001"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={6}
                />
                <button
                  onClick={handleSRNoSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSRNoCancel}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-mono">
                  {srNo}
                </div>
                <button
                  onClick={handleSRNoEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit SR Number"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Format: ABC001 (Month + Number)</p>
        </div>

        {/* Quotation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Quotation Date
          </label>
          <div className="flex items-center space-x-2">
            {isEditingDate ? (
              <>
                <input
                  type="text"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={10}
                />
                <button
                  onClick={handleDateSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDateCancel}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                  {formatQuotationDate(quotationDate)}
                </div>
                <button
                  onClick={handleDateEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit Date"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Click edit to change date</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationHeader;