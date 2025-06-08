
'use client';

interface JsonLdProps {
  data: any;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "АНО ДПО ПЛАТФОРМА",
    "alternateName": "Автономная некоммерческая организация дополнительного профессионального образования ПЛАТФОРМА",
    "url": "https://anoplatforma.ru",
    "logo": "https://i.pinimg.com/originals/45/65/fe/4565fed4af31440101fb760174a3761b.png",
    "description": "Образовательная платформа для повышения квалификации и профессиональной переподготовки",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Примерная, д. 123",
      "addressLocality": "Москва",
      "addressCountry": "RU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-800-123-45-67",
      "contactType": "customer service",
      "email": "info@anoplatforma.ru"
    },
    "sameAs": [
      "https://anoplatforma.ru"
    ]
  };

  return <JsonLd data={organizationData} />;
}

export function CourseJsonLd({ course }: { course: any }) {
  const courseData: any = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "АНО ДПО ПЛАТФОРМА",
      "url": "https://anoplatforma.ru"
    },
    "educationalCredentialAwarded": course.certificate,
    "timeRequired": course.duration,
    "courseMode": course.format === 'ONLINE' ? 'online' : 'onsite',
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock"
    },
    "about": {
      "@type": "Thing",
      "name": course.category.name
    }
  };

  if (course.instructor) {
    courseData.instructor = {
      "@type": "Person",
      "name": course.instructor.name,
      "description": course.instructor.bio
    };
  }

  return <JsonLd data={courseData} />;
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url?: string }> }) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": item.url })
    }))
  };

  return <JsonLd data={breadcrumbData} />;
}
