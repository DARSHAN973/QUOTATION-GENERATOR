// Login API endpoint
// POST /api/auth/login

import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const result = await authenticateUser(email, password);
    
    if (result.success) {
      // Create response with token in cookie
      const response = NextResponse.json({
        success: true,
        user: result.user
      });
      
      // Set HTTP-only cookie for token
      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}