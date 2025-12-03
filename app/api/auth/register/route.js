// Register API endpoint (Admin only)
// POST /api/auth/register

import { NextResponse } from 'next/server';
import { registerUser, getUserFromToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const currentUser = await getUserFromToken(token);
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { email, password, name, role } = await request.json();
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }
    
    const result = await registerUser(
      { email, password, name, role },
      currentUser.id
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}