import { NextResponse } from 'next/server';
import { quotationService } from '../../../../lib/database.js';

export async function GET() {
  try {
    const srNo = await quotationService.getNextSRNumber();
    return NextResponse.json({ srNo });
  } catch (error) {
    console.error('Error generating SR number:', error);
    return NextResponse.json(
      { error: 'Failed to generate SR number' },
      { status: 500 }
    );
  }
}