'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Eye, 
  Edit3, 
  Trash2, 
  Download,
  Plus,
  FileText,
  Clock,
  XCircle,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { 
  getQuotations, 
  deleteQuotation, 
  updateQuotationStatus, 
  searchQuotations,
  exportQuotationsData,
  getQuotationStats
} from '../../utils/quotationStorage.js';

const QuotationHistory = () => {
  const { state, actions } = useApp();
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Load quotations from storage
  const loadQuotations = async () => {
    setLoading(true);
    try {
      const allQuotations = await getQuotations();
      const quotationStats = await getQuotationStats();
      setQuotations(Array.isArray(allQuotations) ? allQuotations : []);
      setFilteredQuotations(Array.isArray(allQuotations) ? allQuotations : []);
      setStats(quotationStats || {});
    } catch (error) {
      console.error('Error loading quotations:', error);
      setQuotations([]);
      setFilteredQuotations([]);
      setStats({});
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  // Filter quotations based on search only (removed status filter)
  useEffect(() => {
    const filterQuotations = async () => {
      let filtered = Array.isArray(quotations) ? quotations : [];

      // Filter by search query
      if (searchQuery.trim()) {
        try {
          filtered = await searchQuotations(searchQuery);
          filtered = Array.isArray(filtered) ? filtered : [];
        } catch (error) {
          console.error('Error searching quotations:', error);
          filtered = [];
        }
      }

      setFilteredQuotations(filtered);
    };

    filterQuotations();
  }, [quotations, searchQuery]);

  // Handle quotation actions
  const handleEditQuotation = (quotation) => {
    actions.loadQuotation(quotation);
    actions.setActiveTab('new-quotation');
  };

  const handleViewQuotation = (quotation) => {
    actions.loadQuotation(quotation);
    actions.setActiveTab('preview-export');
  };

  const handleDeleteQuotation = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(id);
      loadQuotations();
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateQuotationStatus(id, newStatus);
    loadQuotations();
  };

  const handleNewQuotation = () => {
    actions.resetQuotation();
    actions.setActiveTab('new-quotation');
  };

  const handleExportData = () => {
    exportQuotationsData();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage and track all your quotations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quotations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue || 0)}</p>
            </div>
            <div className="text-green-500">₹</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleNewQuotation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading quotations...</p>
          </div>
        ) : !Array.isArray(filteredQuotations) || filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-500 mb-4">
              {!Array.isArray(quotations) || quotations.length === 0 ? 'Create your first quotation to get started.' : 'Try adjusting your search.'}
            </p>
            <button
              onClick={handleNewQuotation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotation ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(Array.isArray(filteredQuotations) ? filteredQuotations : []).map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(quotation.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{quotation.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quotation.orderSettings?.customerName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quotation.orderSettings?.plant} • {quotation.orderSettings?.godown}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(quotation.totals?.totalAmount || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quotation.lineItems?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={quotation.status}
                        onChange={(e) => handleStatusChange(quotation.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(quotation.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quotation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewQuotation(quotation)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditQuotation(quotation)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationHistory;