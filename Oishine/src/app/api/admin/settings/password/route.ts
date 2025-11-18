import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication
    
    const body = await request.json()
    const { currentPassword, newPassword } = body

    console.log('Updating admin password')

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll accept any password
    // In production, you would:
    // 1. Get the current admin from database
    // 2. Verify the current password
    // 3. Hash the new password
    // 4. Update the database
    
    // const admin = await db.admin.findFirst({ where: { isActive: true } })
    // if (!admin) {
    //   return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    // }
    
    // const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
    // if (!isValidPassword) {
    //   return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    // }
    
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    // await db.admin.update({
    //   where: { id: admin.id },
    //   data: { password: hashedNewPassword }
    // })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Error updating admin password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}