'use client';

import React from 'react';
import { 
  Calculator, 
  FileText, 
  History,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { state, actions } = useApp();
  
  const tabs = [
    {
      id: 'quotation-history',
      name: 'Quotation History',
      icon: History,
      description: 'View Previous Quotes'
    },
    {
      id: 'new-quotation',
      name: 'New Quotation',
      icon: Calculator,
      description: 'Create New Quote'
    },
    {
      id: 'preview-export',
      name: 'Preview & Export',
      icon: FileText,
      description: 'Review & Download'
    }
  ];
  
  const handleTabClick = (tabId) => {
    actions.setActiveTab(tabId);
  };
  
  return (
    <div className="w-64 h-screen bg-slate-900 text-white border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Calculation CRM</h1>
            <p className="text-sm text-slate-400">Pipe Rate Calculator</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = state.activeTab === tab.id;
            
            return (
              <li key={tab.id}>
                <button
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={clsx(
                      'w-5 h-5',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )} />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className={clsx(
                        'text-xs',
                        isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                      )}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={clsx(
                    'w-4 h-4 transition-transform',
                    isActive ? 'text-white rotate-90' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          <p>Version 1.0.0</p>
          <p>No data stored • Frontend only</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;