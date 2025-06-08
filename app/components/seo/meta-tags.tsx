
import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage = '/og-default.jpg',
  canonical,
  noIndex = false
}: SEOProps): Metadata {
  const fullTitle = title.includes('АНО ДПО ПЛАТФОРМА') 
    ? title 
    : `${title} | АНО ДПО ПЛАТФОРМА`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      type: 'website',
      siteName: 'АНО ДПО ПЛАТФОРМА'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage]
    }
  };

  if (canonical) {
    metadata.alternates = {
      canonical
    };
  }

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false
    };
  }

  return metadata;
}

export const defaultSEO = {
  title: 'АНО ДПО ПЛАТФОРМА - Курсы повышения квалификации и переподготовки',
  description: 'Образовательная платформа для повышения квалификации педагогов, обучения по охране труда, пожарной безопасности. Дистанционное обучение с выдачей документов установленного образца.',
  keywords: 'повышение квалификации, переподготовка, охрана труда, педагоги, дистанционное обучение, курсы, АНО ДПО'
};
