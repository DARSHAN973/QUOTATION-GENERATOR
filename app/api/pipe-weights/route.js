// API route for pipe weights (offline data)
// GET /api/pipe-weights - Get all pipe weights

import { NextResponse } from 'next/server';
import { pipeWeightsService } from '../../../lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');
    const size = searchParams.get('size');
    const pipeClass = searchParams.get('pipeClass');
    const schedule = searchParams.get('schedule');
    const thickness = searchParams.get('thickness');
    
    // If specific parameters provided, get weight for that pipe
    if (material && size) {
      const weight = await pipeWeightsService.getWeight(material, size, pipeClass, schedule, thickness);
      return NextResponse.json({
        success: true,
        data: { weightPerMtr: weight }
      });
    }
    
    // Otherwise get all pipe weights
    const pipeWeights = await pipeWeightsService.getAll();
    
    return NextResponse.json({
      success: true,
      data: pipeWeights
    });
  } catch (error) {
    console.error('Error fetching pipe weights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipe weights' },
      { status: 500 }
    );
  }
}