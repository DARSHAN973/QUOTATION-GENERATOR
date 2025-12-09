'use client';

import React from 'react';
import { format } from 'date-fns';

const CompanyLetterhead = ({ quotationNumber, quotationDate, customerName, isEditMode, onUpdate }) => {
  return (
    <div className="company-letterhead mb-8 text-center print-text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Date in corner */}
      <div className="text-right mb-4">
        <div className="text-sm text-black">
          <span className="font-semibold">Date:</span> {isEditMode ? (
            <input
              type="date"
              value={quotationDate ? format(new Date(quotationDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => onUpdate && onUpdate('quotationDate', e.target.value)}
              className="ml-2 bg-transparent border-none outline-none text-black focus:bg-white focus:border focus:border-blue-500 focus:rounded px-1"
            />
          ) : (
            quotationDate ? format(new Date(quotationDate), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')
          )}
        </div>
      </div>
      
      {/* Company Logo/Name Area - A4 optimized */}
      <div className="border-4 border-black p-4 mb-4" style={{ pageBreakInside: 'avoid' }}>
        <div className="text-center">
          {/* Company Name */}
          <h1 className="text-2xl font-bold text-black mb-2">
            PIPES & FLOW PRODUCTS
          </h1>
          
          {/* Address Block */}
          <div className="text-sm text-black leading-relaxed mb-3">
            <div className="font-semibold mb-1">
              Office No F-6 1st Floor North Block Sacred World Above KFC
            </div>
            <div className="mb-1">
              Jagtap Chowk Shivarkar Rd Wanowrie Pune
            </div>
            <div className="mb-2">
              <span className="font-semibold">Tel:</span> (020) 66498383 | 
              <span className="font-semibold ml-2">Telefax:</span> (020) 66498306
            </div>
          </div>
          
          {/* Registration Details */}
          <div className="text-xs text-black grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-400 pt-2">
            <div>
              <span className="font-semibold">PAN NO:</span> AABFP4798B
            </div>
            <div>
              <span className="font-semibold">MSME REG. NO:</span> MH26A0092202
            </div>
            <div>
              <span className="font-semibold">GSTIN/UIN:</span> 27AABFP4798B1Z5
            </div>
            <div>
              <span className="font-semibold">State:</span> Maharashtra, Code: 27
            </div>
          </div>
        </div>
      </div>
      
      {/* Quotation Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black underline">
          QUOTATION
        </h2>
      </div>
    </div>
  );
};

export default CompanyLetterhead;