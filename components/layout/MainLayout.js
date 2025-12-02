'use client';

import React from 'react';
import Sidebar from './Sidebar.js';
import { useApp } from '../../context/AppContext.js';

// Import tab components
import QuotationHistory from '../tabs/QuotationHistory.js';
import NewQuotation from '../tabs/NewQuotation.js';
import PreviewExport from '../tabs/PreviewExport.js';

const MainLayout = () => {
  const { state } = useApp();
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'quotation-history':
        return <QuotationHistory />;
      case 'new-quotation':
        return <NewQuotation />;
      case 'preview-export':
        return <PreviewExport />;
      default:
        return <QuotationHistory />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;