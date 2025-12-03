'use client';

import React from 'react';
import { 
  Save, 
  Send, 
  Copy, 
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Download
} from 'lucide-react';

const QuotationActions = ({ 
  onSave, 
  onSendWhatsApp, 
  onCopyPDF, 
  onCopyExcel,
  onExportPDF,
  onExportExcel,
  isLoading = false,
  hasQuotationData = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Save Quotation */}
        <button
          onClick={onSave}
          disabled={!hasQuotationData || isLoading}
          className="flex flex-col items-center space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Save Quotation</span>
        </button>

        {/* Export as PDF */}
        <button
          onClick={onExportPDF}
          disabled={!hasQuotationData || isLoading}
          className="flex flex-col items-center space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileText className="w-6 h-6 text-red-600" />
          <span className="text-sm font-medium text-red-700">Export PDF</span>
        </button>

        {/* Export as Excel */}
        <button
          onClick={onExportExcel}
          disabled={!hasQuotationData || isLoading}
          className="flex flex-col items-center space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-green-700">Export Excel</span>
        </button>

        {/* Send via WhatsApp */}
        <button
          onClick={onSendWhatsApp}
          disabled={!hasQuotationData || isLoading}
          className="flex flex-col items-center space-y-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-green-600" />
          <span className="text-sm font-medium text-green-700">Send WhatsApp</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-700 mb-3">Copy to Clipboard</h4>
        <div className="flex space-x-4">
          <button
            onClick={onCopyPDF}
            disabled={!hasQuotationData || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Copy PDF Link</span>
          </button>

          <button
            onClick={onCopyExcel}
            disabled={!hasQuotationData || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Copy Excel Data</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Processing...
        </div>
      )}
    </div>
  );
};

export default QuotationActions;