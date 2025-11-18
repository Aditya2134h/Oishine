import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleDrivers = [
  {
    name: 'Budi Santoso',
    phone: '+62 812-3456-7890',
    email: 'budi.santoso@oishine.com',
    licenseNumber: 'B1234XYZ',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'B5678CD',
    status: 'AVAILABLE',
    rating: 4.8,
    totalOrders: 156
  },
  {
    name: 'Siti Nurhaliza',
    phone: '+62 813-5678-9012',
    email: 'siti.nurhaliza@oishine.com',
    licenseNumber: 'B2345ABC',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'B6789EF',
    status: 'BUSY',
    rating: 4.9,
    totalOrders: 203
  },
  {
    name: 'Ahmad Wijaya',
    phone: '+62 814-6789-0123',
    email: 'ahmad.wijaya@oishine.com',
    licenseNumber: 'B3456BCD',
    vehicleType: 'Car',
    vehicleNumber: 'B7890GH',
    status: 'AVAILABLE',
    rating: 4.7,
    totalOrders: 89
  },
  {
    name: 'Dewi Lestari',
    phone: '+62 815-7890-1234',
    email: 'dewi.lestari@oishine.com',
    licenseNumber: 'B4567CDE',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'B8901IJ',
    status: 'ON_BREAK',
    rating: 4.6,
    totalOrders: 134
  },
  {
    name: 'Eko Prasetyo',
    phone: '+62 816-8901-2345',
    email: 'eko.prasetyo@oishine.com',
    licenseNumber: 'B5678DEF',
    vehicleType: 'Bicycle',
    vehicleNumber: 'B9012KL',
    status: 'OFFLINE',
    rating: 4.5,
    totalOrders: 67
  }
]

export async function POST() {
  try {
    // Check if drivers already exist
    const existingDrivers = await db.driver.count()
    
    if (existingDrivers > 0) {
      return NextResponse.json({ 
        message: 'Drivers already exist',
        count: existingDrivers 
      })
    }

    // Create sample drivers
    const createdDrivers = await Promise.all(
      sampleDrivers.map(async (driver) => {
        return await db.driver.create({
          data: driver
        })
      })
    )

    return NextResponse.json({
      message: 'Sample drivers created successfully',
      count: createdDrivers.length,
      drivers: createdDrivers
    })
  } catch (error) {
    console.error('Error seeding drivers:', error)
    return NextResponse.json(
      { error: 'Failed to seed drivers' },
      { status: 500 }
    )
  }
}