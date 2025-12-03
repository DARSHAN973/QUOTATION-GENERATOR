// API route for dynamic rates
// GET /api/dynamic-rates - Get rates
// POST /api/dynamic-rates - Update rate

import { NextResponse } from 'next/server';
import { dynamicRatesService } from '../../../lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plant = searchParams.get('plant');
    const material = searchParams.get('material');
    const pipeClass = searchParams.get('pipeClass');
    const schedule = searchParams.get('schedule');
    
    // If specific parameters provided, get rate for that combination
    if (plant && material) {
      const rate = await dynamicRatesService.getRate(plant, material, pipeClass, schedule);
      return NextResponse.json({
        success: true,
        data: { ratePerKg: rate }
      });
    }
    
    // If only plant provided, get all rates for that plant
    if (plant) {
      const rates = await dynamicRatesService.getRatesByPlant(plant);
      return NextResponse.json({
        success: true,
        data: rates
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Plant parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching dynamic rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dynamic rates' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { plant, material, pipeClass, schedule, ratePerKg, effectiveDate } = await request.json();
    
    if (!plant || !material || !ratePerKg || !effectiveDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await dynamicRatesService.updateRate(
      plant,
      material,
      pipeClass,
      schedule,
      ratePerKg,
      effectiveDate
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Rate updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating dynamic rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dynamic rate' },
      { status: 500 }
    );
  }
}