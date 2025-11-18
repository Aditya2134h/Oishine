import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  keywords?: string[]
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    image = '/oishine-logo-optimized.png',
    url = 'https://oishine.com',
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'OISHINE!',
    keywords = []
  } = config

  const fullTitle = title.includes('OISHINE') ? title : `${title} | OISHINE!`
  
  const defaultKeywords = [
    'Oishine',
    'Japanese food',
    'Masakan Jepang',
    'Food delivery',
    'Purwokerto',
    'Sushi',
    'Ramen',
    'Japanese restaurant',
    'Online food order'
  ]

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords].join(', '),
    authors: [{ name: author }],
    creator: 'OISHINE!',
    publisher: 'OISHINE!',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'OISHINE!',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'id_ID',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@oishine',
      site: '@oishine',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      // Add other verification codes as needed
    },
  }
}

export interface ProductSEO {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  availability: boolean
  rating?: number
  reviewCount?: number
}

export function generateProductStructuredData(product: ProductSEO) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'OISHINE!',
    },
    offers: {
      '@type': 'Offer',
      url: `https://oishine.com/products/${product.id}`,
      priceCurrency: 'IDR',
      price: product.price,
      availability: product.availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'OISHINE!',
      },
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    category: product.category,
  }
}

export function generateRestaurantStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'OISHINE!',
    image: 'https://oishine.com/oishine-logo-optimized.png',
    '@id': 'https://oishine.com',
    url: 'https://oishine.com',
    telephone: '+62 812-3456-7890',
    priceRange: 'Rp 25.000 - Rp 150.000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Jend. Gatot Subroto No. 30',
      addressLocality: 'Purwokerto',
      addressRegion: 'Jawa Tengah',
      postalCode: '53116',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.4246,
      longitude: 109.2389,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '23:00',
      },
    ],
    servesCuisine: 'Japanese',
    acceptsReservations: true,
    menu: 'https://oishine.com/#menu',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
    sameAs: [
      'https://www.instagram.com/oishine',
      'https://www.facebook.com/oishine',
      'https://twitter.com/oishine',
    ],
  }
}

export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://oishine.com',
    name: 'OISHINE!',
    image: 'https://oishine.com/oishine-logo-optimized.png',
    description: 'Masakan Jepang autentik dengan citarasa terbaik, disajikan dengan sentuhan modern',
    url: 'https://oishine.com',
    telephone: '+62 812-3456-7890',
    email: 'info@oishine.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Jend. Gatot Subroto No. 30',
      addressLocality: 'Purwokerto',
      addressRegion: 'Jawa Tengah',
      postalCode: '53116',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.4246,
      longitude: 109.2389,
    },
    openingHours: 'Mo-Fr 10:00-22:00, Sa-Su 10:00-23:00',
    priceRange: 'Rp 25.000 - Rp 150.000',
    servesCuisine: ['Japanese', 'Sushi', 'Ramen'],
    paymentAccepted: ['Cash', 'Credit Card', 'QRIS', 'GoPay', 'OVO'],
  }
}
