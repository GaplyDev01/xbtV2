export interface CashFlowItem {
  date: string;
  net_income: number;
  cash_from_operations: number;
  free_cash_flow: number;
  net_change_in_cash: number;
  currency: string;
}

export const getCompanyCashFlow = async (
  symbol: string,
  period: 'QUARTERLY' | 'ANNUAL' = 'QUARTERLY'
): Promise<{ cash_flow: CashFlowItem[] }> => {
  // Mock implementation
  const mockData: CashFlowItem[] = Array.from({ length: 8 }).map((_, index) => ({
    date: new Date(Date.now() - index * (period === 'QUARTERLY' ? 7889400000 : 31557600000)).toISOString(),
    net_income: Math.random() * 1000000000 + 500000000,
    cash_from_operations: Math.random() * 1200000000 + 600000000,
    free_cash_flow: Math.random() * 800000000 + 400000000,
    net_change_in_cash: (Math.random() * 400000000 + 200000000) * (Math.random() > 0.3 ? 1 : -1),
    currency: 'USD'
  }));

  return { cash_flow: mockData };
};

export const formatFinancialValue = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (absValue >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

export const formatFinancialDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};