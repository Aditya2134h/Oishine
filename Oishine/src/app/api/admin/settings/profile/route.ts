import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authMiddleware } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await authMiddleware(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json()
    const { name, email } = body

    console.log('Updating admin profile:', { name, email, adminId: auth.user.id })

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another admin
    const existingAdmin = await db.admin.findFirst({
      where: {
        email: email,
        id: { not: auth.user.id }
      }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email is already taken by another admin' },
        { status: 400 }
      );
    }

    // Update admin profile in database
    const updatedAdmin = await db.admin.update({
      where: { id: auth.user.id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    });

  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}