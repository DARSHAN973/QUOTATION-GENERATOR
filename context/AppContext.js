'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../data/constants.js';
import { SAMPLE_PRICE_LIST } from '../data/priceList.js';
import { loadSettings, saveSettings, loadPriceList, savePriceList } from '../utils/storage.js';
import { saveQuotation as saveQuotationToStorage, getQuotations, getQuotationById } from '../utils/quotationStorage.js';

// Initial state
const initialState = {
  // Current active tab
  activeTab: 'quotation-history',
  
  // Settings
  settings: DEFAULT_SETTINGS,
  
  // Price list
  priceList: SAMPLE_PRICE_LIST,
  
  // Quotation data
  quotation: {
    id: null, // Current quotation ID
    partyName: '',
    srNo: '',
    quotationDate: new Date(),
    status: 'draft',
    orderSettings: {
      supplyType: 'From Godown',
      godown: 'Wagholi',
      plant: 'Hissar',
      gst: 18,
      globalDiscount: 0,
      discountMode: 'show', // 'show' or 'hide'
    },
    lineItems: [],
    bulkCalculation: {
      totalOrderTons: 0,
      vehicleCapacity: 20,
      deadFreightRate: 1000,
      baseRate: 200,
      profitPercentage: 1.5,
      applyToAll: false,
    },
    totals: {
      totalQty: 0,
      totalWeight: 0,
      netAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
    termsAndConditions: {
      paymentTerm: 'Against Delivery',
      validTillDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      showTransportExtra: true,
      showLoadingExtra: true,
      showGodownLocation: true,
      customPaymentTerm: ''
    }
  },
  
  // Saved quotations
  savedQuotations: []
};

// Action types
const actionTypes = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_PRICE_LIST: 'UPDATE_PRICE_LIST',
  UPDATE_QUOTATION_HEADER: 'UPDATE_QUOTATION_HEADER',
  UPDATE_ORDER_SETTINGS: 'UPDATE_ORDER_SETTINGS',
  ADD_LINE_ITEM: 'ADD_LINE_ITEM',
  UPDATE_LINE_ITEM: 'UPDATE_LINE_ITEM',
  UPDATE_LINE_ITEMS: 'UPDATE_LINE_ITEMS',
  REMOVE_LINE_ITEM: 'REMOVE_LINE_ITEM',
  UPDATE_BULK_CALCULATION: 'UPDATE_BULK_CALCULATION',
  UPDATE_TOTALS: 'UPDATE_TOTALS',
  UPDATE_TERMS_AND_CONDITIONS: 'UPDATE_TERMS_AND_CONDITIONS',
  RESET_QUOTATION: 'RESET_QUOTATION',
  LOAD_QUOTATION: 'LOAD_QUOTATION',
  SAVE_QUOTATION: 'SAVE_QUOTATION',
  SET_CURRENT_QUOTATION_ID: 'SET_CURRENT_QUOTATION_ID',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };
      
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    case actionTypes.UPDATE_PRICE_LIST:
      return {
        ...state,
        priceList: action.payload
      };
      
    case actionTypes.UPDATE_QUOTATION_HEADER:
      return {
        ...state,
        quotation: { ...state.quotation, ...action.payload }
      };
      
    case actionTypes.UPDATE_ORDER_SETTINGS:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          orderSettings: { ...state.quotation.orderSettings, ...action.payload }
        }
      };
      
    case actionTypes.ADD_LINE_ITEM:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          lineItems: [...state.quotation.lineItems, action.payload]
        }
      };
      
    case actionTypes.UPDATE_LINE_ITEM:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          lineItems: state.quotation.lineItems.map(item => 
            item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
          )
        }
      };
      
    case actionTypes.UPDATE_LINE_ITEMS:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          lineItems: action.payload
        }
      };
      
    case actionTypes.REMOVE_LINE_ITEM:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          lineItems: state.quotation.lineItems.filter(item => item.id !== action.payload)
        }
      };
      
    case actionTypes.UPDATE_BULK_CALCULATION:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          bulkCalculation: { ...state.quotation.bulkCalculation, ...action.payload }
        }
      };
      
    case actionTypes.UPDATE_TERMS_AND_CONDITIONS:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          termsAndConditions: { ...state.quotation.termsAndConditions, ...action.payload }
        }
      };
      
    case actionTypes.UPDATE_TOTALS:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          totals: action.payload
        }
      };
      
    case actionTypes.RESET_QUOTATION:
      return {
        ...state,
        quotation: initialState.quotation
      };
      
    case actionTypes.LOAD_QUOTATION:
      return {
        ...state,
        quotation: action.payload
      };
      
    case actionTypes.SAVE_QUOTATION:
      // This case doesn't change state, just triggers saving
      return state;
      
    case actionTypes.SET_CURRENT_QUOTATION_ID:
      return {
        ...state,
        quotation: {
          ...state.quotation,
          id: action.payload
        }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load settings and price list from localStorage on init
  useEffect(() => {
    const savedSettings = loadSettings(DEFAULT_SETTINGS);
    const savedPriceList = loadPriceList(SAMPLE_PRICE_LIST);
    
    dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: savedSettings });
    dispatch({ type: actionTypes.UPDATE_PRICE_LIST, payload: savedPriceList });
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);
  
  // Save price list to localStorage when it changes
  useEffect(() => {
    savePriceList(state.priceList);
  }, [state.priceList]);
  
  // Action creators
  const actions = {
    setActiveTab: (tab) => dispatch({ type: actionTypes.SET_ACTIVE_TAB, payload: tab }),
    
    updateSettings: (settings) => dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: settings }),
    
    updatePriceList: (priceList) => dispatch({ type: actionTypes.UPDATE_PRICE_LIST, payload: priceList }),
    
    updateQuotationHeader: (headerData) => dispatch({ type: actionTypes.UPDATE_QUOTATION_HEADER, payload: headerData }),
    
    updateQuotationDate: (date) => dispatch({ 
      type: actionTypes.UPDATE_QUOTATION_HEADER, 
      payload: { quotationDate: new Date(date) } 
    }),
    
    updatePartyName: (name) => dispatch({ 
      type: actionTypes.UPDATE_QUOTATION_HEADER, 
      payload: { partyName: name } 
    }),
    
    updateOrderSettings: (settings) => dispatch({ type: actionTypes.UPDATE_ORDER_SETTINGS, payload: settings }),
    
    addLineItem: (item) => dispatch({ type: actionTypes.ADD_LINE_ITEM, payload: item }),
    
    updateLineItem: (id, updates) => dispatch({ 
      type: actionTypes.UPDATE_LINE_ITEM, 
      payload: { id, updates } 
    }),
    
    updateLineItems: (items) => dispatch({
      type: actionTypes.UPDATE_LINE_ITEMS,
      payload: items
    }),
    
    removeLineItem: (id) => dispatch({ type: actionTypes.REMOVE_LINE_ITEM, payload: id }),
    
    updateBulkCalculation: (calculation) => dispatch({ 
      type: actionTypes.UPDATE_BULK_CALCULATION, 
      payload: calculation 
    }),
    
    updateTermsAndConditions: (terms) => dispatch({
      type: actionTypes.UPDATE_TERMS_AND_CONDITIONS,
      payload: terms
    }),
    
    updateTotals: (totals) => dispatch({ type: actionTypes.UPDATE_TOTALS, payload: totals }),
    
    resetQuotation: () => dispatch({ type: actionTypes.RESET_QUOTATION }),
    
    loadQuotation: (quotation) => dispatch({ type: actionTypes.LOAD_QUOTATION, payload: quotation }),
    
    // New quotation saving actions
    saveQuotation: () => {
      const savedQuotation = saveQuotationToStorage(state.quotation);
      dispatch({ type: actionTypes.SET_CURRENT_QUOTATION_ID, payload: savedQuotation.id });
      return savedQuotation;
    },
    
    loadQuotationById: (id) => {
      const quotation = getQuotationById(id);
      if (quotation) {
        dispatch({ type: actionTypes.LOAD_QUOTATION, payload: quotation });
        return true;
      }
      return false;
    },
    
    setCurrentQuotationId: (id) => dispatch({ type: actionTypes.SET_CURRENT_QUOTATION_ID, payload: id }),
  };
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};