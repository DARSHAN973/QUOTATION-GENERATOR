// Current user API endpoint
// GET /api/auth/me

import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth.js';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}