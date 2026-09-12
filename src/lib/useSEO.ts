import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'profile' | 'article';
  jsonLd?: Record<string, any>;
}

const BASE_URL = 'https://kobirsahabuddin.netlify.app';
const DEFAULT_IMAGE = `${BASE_URL}/assets/kobir-sahabuddin-portrait.webp`;

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setRouteSchema(jsonLd?: Record<string, any>) {
  const schemaId = 'dynamic-route-schema';
  let script = document.getElementById(schemaId) as HTMLScriptElement | null;
  
  if (!jsonLd) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

export function useSEO({
  title,
  description,
  canonical,
  keywords,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  jsonLd
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }

    // 2. Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    // 3. Keywords
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 4. Canonical & URL
    const fullCanonical = canonical
      ? (canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`)
      : window.location.href;
    setCanonical(fullCanonical);
    setMetaTag('property', 'og:url', fullCanonical);

    // 5. Open Graph & Twitter Image
    const fullImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
    setMetaTag('property', 'og:image', fullImage);
    setMetaTag('name', 'twitter:image', fullImage);

    // 6. Type
    setMetaTag('property', 'og:type', ogType);

    // 7. Route Specific JSON-LD Schema
    if (jsonLd) {
      setRouteSchema(jsonLd);
    }

    return () => {
      // Optional cleanup for dynamic schema on route change
      setRouteSchema(undefined);
    };
  }, [title, description, canonical, keywords, ogImage, ogType, jsonLd]);
}
