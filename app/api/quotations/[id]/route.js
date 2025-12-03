// API route for individual quotation operations
// GET /api/quotations/[id] - Get quotation by ID
// PUT /api/quotations/[id] - Update quotation
// DELETE /api/quotations/[id] - Delete quotation

import { NextResponse } from 'next/server';
import { quotationService } from '../../../../lib/database.js';

export async function GET(request, { params }) {
  try {
    const quotation = await quotationService.getQuotationById(params.id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const updateData = await request.json();
    
    const result = await quotationService.updateQuotation(params.id, updateData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const result = await quotationService.deleteQuotation(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Quotation deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quotation' },
      { status: 500 }
    );
  }
}