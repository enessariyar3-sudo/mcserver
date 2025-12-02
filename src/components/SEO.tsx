import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export const SEO = ({
  title = 'IndusNetwork - Premium Minecraft Server',
  description = 'Join thousands of players in epic Minecraft adventures. Premium ranks, custom features, and an amazing community await you.',
  keywords = 'minecraft server, minecraft network, premium minecraft, minecraft ranks, minecraft community, multiplayer minecraft',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonicalUrl
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullTitle = title.includes('IndusNetwork') ? title : `${title} | IndusNetwork`;
  const canonical = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#8B5CF6" />
      
      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
};
