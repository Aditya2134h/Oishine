import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching public store settings (db)')
    const store = await db.storeSettings.findFirst()

    if (store) {
      return NextResponse.json({
        success: true,
        data: {
          storeName: store.storeName,
          storeEmail: store.storeEmail,
          storePhone: store.storePhone,
          storeAddress: store.storeAddress,
          storeDescription: store.storeDescription,
          currency: store.currency,
          taxRate: store.taxRate,
          contactEmail: store.contactEmail,
          contactPhone: store.contactPhone,
          contactAddress: store.contactAddress,
          weekdayHours: store.weekdayHours,
          weekendHours: store.weekendHours,
          holidayHours: store.holidayHours,
          instagram: store.instagram || '',
          facebook: store.facebook || '',
          twitter: store.twitter || ''
        }
      })
    }

    // Fallback defaults
    return NextResponse.json({
      success: true,
      data: {
        storeName: 'Oishine!',
        storeEmail: 'admin@oishine.com',
        storePhone: '+62 812-3456-7890',
        storeAddress: 'Purwokerto, Indonesia',
        storeDescription: 'Delicious Japanese Food Delivery - Purwokerto',
        currency: 'IDR',
        taxRate: 11,
        contactEmail: 'info@oishine.com',
        contactPhone: '+62 281 123456',
        contactAddress: 'Jl. Jend. Gatot Subroto No. 30, Purwokerto',
        weekdayHours: '10:00 - 22:00',
        weekendHours: '10:00 - 23:00',
        holidayHours: '10:00 - 23:00',
        instagram: 'https://instagram.com/oishine',
        facebook: 'https://facebook.com/oishine',
        twitter: 'https://x.com/oishine'
      }
    })

  } catch (error) {
    console.error('Error fetching store settings:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}