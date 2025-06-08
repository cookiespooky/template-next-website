
'use client'

import { usePathname } from 'next/navigation'

export function JsonLd() {
  const pathname = usePathname()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Course Platform',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Leading online education platform offering comprehensive courses and tutorials',
    sameAs: [
      'https://twitter.com/courseplatform',
      'https://facebook.com/courseplatform',
      'https://linkedin.com/company/courseplatform',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'customer service',
      email: 'support@courseplatform.com',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Course Platform Blog',
    url: siteUrl,
    description: 'Discover the latest insights, tutorials, and industry trends in online education',
    publisher: {
      '@type': 'Organization',
      name: 'Course Platform',
      logo: `${siteUrl}/logo.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Course Platform Blog',
    url: siteUrl,
    description: 'Latest insights and tutorials in online education',
    publisher: {
      '@type': 'Organization',
      name: 'Course Platform',
      logo: `${siteUrl}/logo.png`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      ...(pathname !== '/' ? [{
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}${pathname}`,
      }] : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  )
}
