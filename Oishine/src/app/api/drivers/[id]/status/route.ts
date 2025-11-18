import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, location } = body

    if (!status || !['AVAILABLE', 'BUSY', 'OFFLINE', 'ON_BREAK'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    
    if (location) {
      updateData.currentLocation = JSON.stringify(location)
    }

    const driver = await db.driver.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error updating driver status:', error)
    return NextResponse.json(
      { error: 'Failed to update driver status' },
      { status: 500 }
    )
  }
}