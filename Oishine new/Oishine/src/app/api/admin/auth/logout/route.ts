import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication (optional for logout, but good practice)
    const auth = await authMiddleware(request);
    
    // Create response and clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear the admin-token cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}