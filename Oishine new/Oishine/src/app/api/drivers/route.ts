import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { vehicleNumber: { contains: search } }
      ]
    }

    const [drivers, total] = await Promise.all([
      db.driver.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { orders: true }
          }
        }
      }),
      db.driver.count({ where })
    ])

    return NextResponse.json({
      drivers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      phone,
      email,
      licenseNumber,
      vehicleType,
      vehicleNumber
    } = body

    // Validate required fields
    if (!name || !phone || !licenseNumber || !vehicleType || !vehicleNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if license number already exists
    const existingDriver = await db.driver.findFirst({
      where: {
        OR: [
          { licenseNumber },
          { vehicleNumber }
        ]
      }
    })

    if (existingDriver) {
      return NextResponse.json(
        { error: 'License number or vehicle number already exists' },
        { status: 400 }
      )
    }

    const driver = await db.driver.create({
      data: {
        name,
        phone,
        email,
        licenseNumber,
        vehicleType,
        vehicleNumber,
        status: 'AVAILABLE'
      }
    })

    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    )
  }
}