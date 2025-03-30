export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  published: string;
  category: string;
  subCategory?: string;
  authors?: Array<{ name: string }>;
  source?: string;
  imageUrl?: string;
}

export const getLatestNews = async (
  page: number = 1,
  limit: number = 10,
  timeframe: '24h' | '7d' | '30d' = '24h'
): Promise<NewsArticle[]> => {
  try {
    // Using CryptoCompare News API (free tier)
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular&limit=${limit}&api_key=e92ecfa3f2abccc0b3718c1aaf5860f54c35a57b0b8ba2b8fc0f8c3a9f80f8a6`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CryptoCompare API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our NewsArticle interface
    if (data.Data && Array.isArray(data.Data)) {
      return data.Data.map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        summary: article.body.substring(0, 150) + '...',
        link: article.url,
        published: new Date(article.published_on * 1000).toISOString(),
        category: article.categories || 'Crypto',
        source: article.source,
        authors: article.source ? [{ name: article.source }] : [],
        imageUrl: article.imageurl
      }));
    }
    
    throw new Error('Invalid data format from CryptoCompare API');
  } catch (cryptoCompareError) {
    console.error('Error fetching news from CryptoCompare:', cryptoCompareError);
    
    // Try alternate free API - NewsAPI.org (limited to 100 requests/day)
    try {
      console.log('Attempting to use NewsAPI fallback...');
      const newsApiUrl = `https://newsapi.org/v2/everything?q=crypto+OR+bitcoin+OR+ethereum&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=25a1f4b95a9a4866890a33f63bcda32c`;
      
      const newsApiResponse = await fetch(newsApiUrl);
      
      if (!newsApiResponse.ok) {
        throw new Error(`NewsAPI returned ${newsApiResponse.status}`);
      }
      
      const newsApiData = await newsApiResponse.json();
      
      if (newsApiData.articles && Array.isArray(newsApiData.articles)) {
        return newsApiData.articles.map((article: any, index: number) => ({
          id: index.toString(),
          title: article.title,
          summary: article.description || article.content || 'No description available',
          link: article.url,
          published: new Date(article.publishedAt).toISOString(),
          category: 'Crypto',
          source: article.source?.name,
          authors: article.author ? [{ name: article.author }] : [],
          imageUrl: article.urlToImage
        }));
      }
      
      throw new Error('Invalid data format from NewsAPI');
    } catch (newsApiError) {
      console.error('Error fetching news from NewsAPI fallback:', newsApiError);
      
      // Final fallback to mock data if both APIs fail
      const mockNews: NewsArticle[] = [
        {
          id: '1',
          title: 'Bitcoin Surges Past $50,000',
          summary: 'Bitcoin has reached a new milestone...',
          link: 'https://example.com/news/1',
          published: new Date().toISOString(),
          category: 'Market',
          authors: [{ name: 'John Doe' }]
        },
        {
          id: '2',
          title: 'Ethereum 2.0 Update Progress',
          summary: 'The Ethereum network upgrade continues...',
          link: 'https://example.com/news/2',
          published: new Date().toISOString(),
          category: 'Technology',
          authors: [{ name: 'Jane Smith' }]
        }
      ];
      
      return mockNews;
    }
  }
};

export const getNewsForToken = async (
  symbol: string,
  page: number = 1,
  limit: number = 10
): Promise<NewsArticle[]> => {
  try {
    // Using CryptoCompare News API with category filter
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${symbol.toUpperCase()}&sortOrder=popular&limit=${limit}&api_key=e92ecfa3f2abccc0b3718c1aaf5860f54c35a57b0b8ba2b8fc0f8c3a9f80f8a6`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CryptoCompare API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our NewsArticle interface
    if (data.Data && Array.isArray(data.Data)) {
      return data.Data.map((article: any) => ({
        id: article.id.toString(),
        title: article.title,
        summary: article.body.substring(0, 150) + '...',
        link: article.url,
        published: new Date(article.published_on * 1000).toISOString(),
        category: article.categories || 'Crypto',
        source: article.source,
        authors: article.source ? [{ name: article.source }] : [],
        imageUrl: article.imageurl
      }));
    }
    
    // Try alternate API with token-specific search
    try {
      console.log(`Attempting to use NewsAPI fallback for ${symbol}...`);
      const newsApiUrl = `https://newsapi.org/v2/everything?q=${symbol}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=25a1f4b95a9a4866890a33f63bcda32c`;
      
      const newsApiResponse = await fetch(newsApiUrl);
      
      if (!newsApiResponse.ok) {
        throw new Error(`NewsAPI returned ${newsApiResponse.status}`);
      }
      
      const newsApiData = await newsApiResponse.json();
      
      if (newsApiData.articles && Array.isArray(newsApiData.articles)) {
        return newsApiData.articles.map((article: any, index: number) => ({
          id: index.toString(),
          title: article.title,
          summary: article.description || article.content || 'No description available',
          link: article.url,
          published: new Date(article.publishedAt).toISOString(),
          category: 'Crypto',
          source: article.source?.name,
          authors: article.author ? [{ name: article.author }] : [],
          imageUrl: article.urlToImage
        }));
      }
    } catch (newsApiError) {
      console.error(`Error fetching token news from NewsAPI fallback for ${symbol}:`, newsApiError);
    }
    
    // If no specific token news found, fall back to general news
    return getLatestNews(page, limit, "24h");
  } catch (error) {
    console.error(`Error fetching news for token ${symbol}:`, error);
    // Fall back to general news
    return getLatestNews(page, limit, "24h");
  }
};