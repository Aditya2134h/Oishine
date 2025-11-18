'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating)
    }

    // Send to analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    })

    // Use navigator.sendBeacon if available for better reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', body)
    } else {
      fetch('/api/analytics/web-vitals', {
        body,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch((err) => {
        console.error('Failed to send web vitals:', err)
      })
    }

    // Track critical metrics
    switch (metric.name) {
      case 'LCP':
        // Largest Contentful Paint - should be < 2.5s
        if (metric.value > 2500) {
          console.warn(`⚠️ LCP is slow: ${metric.value}ms (target: < 2500ms)`)
        }
        break
      case 'FID':
        // First Input Delay - should be < 100ms
        if (metric.value > 100) {
          console.warn(`⚠️ FID is slow: ${metric.value}ms (target: < 100ms)`)
        }
        break
      case 'CLS':
        // Cumulative Layout Shift - should be < 0.1
        if (metric.value > 0.1) {
          console.warn(`⚠️ CLS is high: ${metric.value} (target: < 0.1)`)
        }
        break
      case 'FCP':
        // First Contentful Paint - should be < 1.8s
        if (metric.value > 1800) {
          console.warn(`⚠️ FCP is slow: ${metric.value}ms (target: < 1800ms)`)
        }
        break
      case 'TTFB':
        // Time to First Byte - should be < 600ms
        if (metric.value > 600) {
          console.warn(`⚠️ TTFB is slow: ${metric.value}ms (target: < 600ms)`)
        }
        break
      case 'INP':
        // Interaction to Next Paint - should be < 200ms
        if (metric.value > 200) {
          console.warn(`⚠️ INP is slow: ${metric.value}ms (target: < 200ms)`)
        }
        break
    }
  })

  return null
}

export function logPerformanceMetrics() {
  if (typeof window === 'undefined') return

  useEffect(() => {
    // Log page load performance
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      const connectTime = perfData.responseEnd - perfData.requestStart
      const renderTime = perfData.domComplete - perfData.domLoading

      console.log('[Performance Metrics]', {
        pageLoadTime: `${pageLoadTime}ms`,
        connectTime: `${connectTime}ms`,
        renderTime: `${renderTime}ms`,
        timestamp: new Date().toISOString(),
      })

      // Get resource timing
      const resources = performance.getEntriesByType('resource')
      const slowResources = resources
        .filter((resource: any) => resource.duration > 1000)
        .map((resource: any) => ({
          name: resource.name,
          duration: `${Math.round(resource.duration)}ms`,
          type: resource.initiatorType,
        }))

      if (slowResources.length > 0) {
        console.warn('[Slow Resources]', slowResources)
      }
    })
  }, [])
}
