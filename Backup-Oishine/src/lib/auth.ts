import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  status?: number;
}

export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header first (priority), then fallback to cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('admin-token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Token tidak ditemukan',
        status: 401
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.id) {
      return {
        success: false,
        error: 'Token tidak valid',
        status: 401
      };
    }

    // Get admin from database
    const admin = await db.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      return {
        success: false,
        error: 'Admin tidak ditemukan',
        status: 401
      };
    }

    if (!admin.isActive) {
      return {
        success: false,
        error: 'Akun admin tidak aktif',
        status: 401
      };
    }

    return {
      success: true,
      user: admin
    };

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Check if it's a JWT expiration error
    if (error instanceof jwt.JsonWebTokenError) {
      let errorMessage = 'Token tidak valid';
      if (error.message === 'jwt malformed') {
        errorMessage = 'Token format tidak valid';
      } else if (error.message === 'jwt expired') {
        errorMessage = 'Token kadaluarsa, silakan login kembali';
      }
      
      return {
        success: false,
        error: errorMessage,
        status: 401
      };
    }
    
    return {
      success: false,
      error: 'Token tidak valid',
      status: 401
    };
  }
}