// API route for quotations CRUD operations
// GET /api/quotations - Get all quotations
// POST /api/quotations - Create new quotation

import { NextResponse } from 'next/server';
import { quotationService } from '../../../lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status'),
      partyName: searchParams.get('partyName'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo')
    };
    
    // Remove null values
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    
    const quotations = await quotationService.getQuotations(filters);
    
    return NextResponse.json({
      success: true,
      data: quotations
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const quotationData = await request.json();
    
    // Generate SR number if not provided
    if (!quotationData.srNo) {
      quotationData.srNo = await quotationService.getNextSRNumber();
    }
    
    const result = await quotationService.createQuotation(quotationData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    );
  }
}