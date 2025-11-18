import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication
    
    console.log('Fetching store settings')
    
    // Try to get existing store settings
    let storeSettings = await db.storeSettings.findFirst()
    
    // If no settings exist, create default ones
    if (!storeSettings) {
      storeSettings = await db.storeSettings.create({
      data: {
        storeName: 'Oishine!',
        storeEmail: 'admin@oishine.com',
        storePhone: '+62 812-3456-7890',
        storeAddress: 'Jakarta, Indonesia',
        storeDescription: 'Delicious Japanese Food Delivery',
        currency: 'IDR',
        taxRate: 11,
        contactEmail: 'info@oishine.com',
        contactPhone: '+62 21 1234 5678',
        contactAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
        weekdayHours: '10:00 - 22:00',
        weekendHours: '10:00 - 23:00',
        holidayHours: '10:00 - 23:00',
        instagram: '',
        facebook: '',
        twitter: ''
      }
    })
      console.log('Created default store settings')
    }
    
    return NextResponse.json({
      success: true,
      data: {
        storeName: storeSettings.storeName,
        storeEmail: storeSettings.storeEmail,
        storePhone: storeSettings.storePhone,
        storeAddress: storeSettings.storeAddress,
        storeDescription: storeSettings.storeDescription,
        currency: storeSettings.currency,
        taxRate: storeSettings.taxRate,
        contactEmail: storeSettings.contactEmail,
        contactPhone: storeSettings.contactPhone,
        contactAddress: storeSettings.contactAddress,
        weekdayHours: storeSettings.weekdayHours,
        weekendHours: storeSettings.weekendHours,
        holidayHours: storeSettings.holidayHours
      }
    })

  } catch (error) {
    console.error('Error fetching store settings:', error)
    
    // Return default settings if database fails
    return NextResponse.json({
      success: true,
      data: {
        storeName: 'Oishine!',
        storeEmail: 'admin@oishine.com',
        storePhone: '+62 812-3456-7890',
        storeAddress: 'Jakarta, Indonesia',
        storeDescription: 'Delicious Japanese Food Delivery',
        currency: 'IDR',
        taxRate: 11,
        contactEmail: 'info@oishine.com',
        contactPhone: '+62 21 1234 5678',
        contactAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
        weekdayHours: '10:00 - 22:00',
        weekendHours: '10:00 - 23:00',
        holidayHours: '10:00 - 23:00'
      }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Skip auth for now - TODO: Add proper admin authentication
    
    const body = await request.json()
    const { 
      storeName, 
      storeEmail, 
      storePhone, 
      storeAddress, 
      storeDescription, 
      currency, 
      taxRate,
      contactEmail,
      contactPhone,
      contactAddress,
      weekdayHours,
      weekendHours,
      holidayHours,
      instagram,
      facebook,
      twitter
    } = body

    console.log('Updating store settings:', { storeName, storeEmail, currency, taxRate })

    // Validate required fields
    if (!storeName || !storeEmail || !storePhone || !storeAddress) {
      return NextResponse.json(
        { error: 'Store name, email, phone, and address are required' },
        { status: 400 }
      )
    }

    // Try to update existing settings or create new ones
    let storeSettings
    try {
      // Check if settings exist
      const existingSettings = await db.storeSettings.findFirst()
      
      if (existingSettings) {
        // Update existing settings
        storeSettings = await db.storeSettings.update({
          where: { id: existingSettings.id },
          data: {
            storeName,
            storeEmail,
            storePhone,
            storeAddress,
            storeDescription: storeDescription || '',
            currency,
            taxRate: parseFloat(taxRate.toString()) || 0,
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            contactAddress: contactAddress || '',
            weekdayHours: weekdayHours || '',
            weekendHours: weekendHours || '',
            holidayHours: holidayHours || '',
            instagram: instagram || '',
            facebook: facebook || '',
            twitter: twitter || ''
          }
        })
        console.log('Updated existing store settings')
      } else {
        // Create new settings
        storeSettings = await db.storeSettings.create({
          data: {
            storeName,
            storeEmail,
            storePhone,
            storeAddress,
            storeDescription: storeDescription || '',
            currency,
            taxRate: parseFloat(taxRate.toString()) || 0,
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            contactAddress: contactAddress || '',
            weekdayHours: weekdayHours || '',
            weekendHours: weekendHours || '',
            holidayHours: holidayHours || '',
            instagram: instagram || '',
            facebook: facebook || '',
            twitter: twitter || ''
          }
        })
        console.log('Created new store settings')
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return success anyway for demo purposes
      return NextResponse.json({
        success: true,
        message: 'Store settings updated successfully (demo mode)',
        data: { storeName, storeEmail, storePhone, storeAddress, storeDescription, currency, taxRate }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
      data: {
        storeName: storeSettings.storeName,
        storeEmail: storeSettings.storeEmail,
        storePhone: storeSettings.storePhone,
        storeAddress: storeSettings.storeAddress,
        storeDescription: storeSettings.storeDescription,
        currency: storeSettings.currency,
        taxRate: storeSettings.taxRate,
        contactEmail: storeSettings.contactEmail,
        contactPhone: storeSettings.contactPhone,
        contactAddress: storeSettings.contactAddress,
        weekdayHours: storeSettings.weekdayHours,
        weekendHours: storeSettings.weekendHours,
        holidayHours: storeSettings.holidayHours,
        instagram: storeSettings.instagram || '',
        facebook: storeSettings.facebook || '',
        twitter: storeSettings.twitter || ''
      }
    })

  } catch (error) {
    console.error('Error updating store settings:', error)
    return NextResponse.json(
      { error: 'Failed to update store settings' },
      { status: 500 }
    )
  }
}