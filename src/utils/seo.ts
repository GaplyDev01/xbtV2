/**
 * SEO utility functions
 */

// Get page-specific meta title
export const getPageTitle = (page: string): string => {
  const baseTitle = 'TradesXBT';
  
  const titles: Record<string, string> = {
    dashboard: 'Dashboard | TradesXBT',
    'crypto-explorer': 'Crypto Explorer | TradesXBT',
    'xbt-hud': 'XBT HUD | TradesXBT',
    path: 'The Path | TradesXBT',
    portfolio: 'Portfolio | TradesXBT',
    settings: 'Settings | TradesXBT',
    help: 'Help & Community | TradesXBT'
  };

  return titles[page] || `${page} | ${baseTitle}`;
};

// Get page-specific meta description
export const getPageDescription = (page: string): string => {
  const descriptions: Record<string, string> = {
    dashboard: 'Comprehensive cryptocurrency dashboard with real-time market data, social sentiment, and AI-powered insights.',
    'crypto-explorer': 'Explore and analyze cryptocurrency tokens with detailed market metrics and technical analysis.',
    'xbt-hud': 'AI-powered crypto trading assistant providing real-time market analysis and trading signals.',
    path: 'Prove your trading expertise and earn your vision through successful market calls.',
    portfolio: 'Track and manage your cryptocurrency portfolio with advanced analytics and performance metrics.',
    settings: 'Customize your TradesXBT experience with personalized settings and preferences.',
    help: 'Access comprehensive guides, tutorials, and community support for TradesXBT platform.'
  };

  return descriptions[page] || 'Advanced cryptocurrency analysis platform with AI-powered insights and real-time market data.';
};

// Get page-specific OpenGraph image
export const getPageImage = (page: string): string => {
  const images: Record<string, string> = {
    dashboard: 'https://tradesxbt.com/og/dashboard.jpg',
    'crypto-explorer': 'https://tradesxbt.com/og/crypto-explorer.jpg',
    'xbt-hud': 'https://tradesxbt.com/og/xbt-hud.jpg',
    path: 'https://tradesxbt.com/og/the-path.jpg'
  };

  return images[page] || 'https://tradesxbt.com/og-image.jpg';
};