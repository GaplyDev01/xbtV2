/**
 * Utility functions for rendering charts
 */

// Format large numbers with K, M, B suffixes
export const formatLargeNumber = (num: number, digits = 1): string => {
  if (num === undefined || num === null) return 'N/A';
  
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
};

// Format currency values
export const formatCurrency = (value: number, currency = 'USD', compact = false): string => {
  if (value === undefined || value === null) return 'N/A';
  
  try {
    if (compact) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }
    
    // For very small values (like small cap tokens), show more decimal places
    let maximumFractionDigits = 2;
    
    if (value < 0.01) {
      maximumFractionDigits = 8;
    } else if (value < 1) {
      maximumFractionDigits = 6;
    } else if (value < 1000) {
      maximumFractionDigits = 4;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${value.toFixed(2)}`;
  }
};

// Format percentage values
export const formatPercentage = (value: number, plusSign = true): string => {
  if (value === undefined || value === null) return 'N/A';
  
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (value > 0 && plusSign) {
    return `+${formatted}`;
  } else if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
};

// Generate timestamp labels for charts
export const generateTimeLabels = (
  interval: 'hour' | 'day' | 'week' | 'month' | 'year',
  count: number
): string[] => {
  const now = new Date();
  const labels: string[] = [];
  
  for (let i = count - 1; i >= 0; i--) {
    let date = new Date();
    
    if (interval === 'hour') {
      date = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (interval === 'day') {
      date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    } else if (interval === 'week') {
      date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    } else if (interval === 'month') {
      date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString([], { month: 'short', year: '2-digit' }));
    } else if (interval === 'year') {
      date = new Date(now.getFullYear() - i, 0, 1);
      labels.push(date.getFullYear().toString());
    }
  }
  
  return labels;
};

// Generate mock chart data
export const generateMockChartData = (
  count: number,
  baseValue: number,
  volatility: number,
  trend: 'up' | 'down' | 'sideways' = 'sideways'
): number[] => {
  let currentValue = baseValue;
  const data: number[] = [currentValue];
  
  // Define trend factor
  const trendFactor = trend === 'up' ? 0.015 : trend === 'down' ? -0.015 : 0;
  
  for (let i = 1; i < count; i++) {
    // Random change with volatility factor
    const change = ((Math.random() - 0.5) * 2) * volatility * currentValue;
    
    // Apply trend
    const trendChange = currentValue * trendFactor;
    
    // Update value with change and trend
    currentValue = currentValue + change + trendChange;
    
    // Ensure value doesn't go negative
    currentValue = Math.max(currentValue, baseValue * 0.1);
    
    data.push(currentValue);
  }
  
  return data;
};

// Calculate simple moving average
export const calculateSMA = (data: number[], period: number): number[] => {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN); // Not enough data for SMA calculation
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
};

// Calculate relative strength index (RSI)
export const calculateRSI = (data: number[], period: number = 14): number[] => {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate gains and losses
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate average gains and losses
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(NaN); // Not enough data for RSI calculation
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return rsi;
};