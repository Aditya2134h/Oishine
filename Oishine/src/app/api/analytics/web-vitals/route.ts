import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Log web vital metric
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date().toISOString(),
    })

    // Here you can send to your analytics service
    // Examples:
    // - Google Analytics
    // - Vercel Analytics
    // - Custom analytics endpoint
    // - Database for historical tracking

    // Example: Send to Google Analytics (if gtag is configured)
    if (typeof globalThis.gtag !== 'undefined') {
      globalThis.gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_id: metric.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Web Vitals Error]', error)
    return NextResponse.json({ error: 'Failed to process metric' }, { status: 500 })
  }
}
