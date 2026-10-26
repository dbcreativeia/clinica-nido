import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  author?: string;
  schemaJson?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

const BASE_URL = 'https://www.nidoestetica.com.br';
const DEFAULT_IMAGE = `${BASE_URL}/foto-clinica_1.webp`;

function setMetaTag(name: string, content: string, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  keywords,
  author = 'Clínica Nidô - Dra. Brenda Niyama',
  schemaJson,
  noIndex = false
}) => {
  useEffect(() => {
    // 1. Atualizar Título da Página
    document.title = title;

    // 2. Robots Indexing
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Resolver URL Canônica e Imagem Absoluta
    const canonicalUrl = `${BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    let absoluteImage = DEFAULT_IMAGE;
    if (image) {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        absoluteImage = image;
      } else {
        absoluteImage = `${BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
      }
    }

    // 4. Meta Tags Essenciais para Busca (Google / Bing / LLMs)
    setMetaTag('description', description);
    setMetaTag('author', author);
    if (keywords && keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }
    setCanonicalLink(canonicalUrl);

    // 4. OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Discord, Telegram)
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:image', absoluteImage, true);
    setMetaTag('og:site_name', 'Clínica Nidô', true);
    setMetaTag('og:locale', 'pt_BR', true);

    // 5. Twitter / X Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', absoluteImage);

    // 6. Schema.org JSON-LD Específico da Página (Google Rich Snippets & LLMs)
    let scriptElement = document.getElementById('seo-dynamic-schema') as HTMLScriptElement | null;
    if (schemaJson) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-dynamic-schema';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(schemaJson);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Cleanup do schema dinâmico ao desmontar
      const el = document.getElementById('seo-dynamic-schema');
      if (el) {
        el.remove();
      }
    };
  }, [title, description, canonicalPath, image, type, keywords, author, schemaJson, noIndex]);

  return null;
};
