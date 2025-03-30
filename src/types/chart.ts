export interface ChartPoint {
  time: string;
  value: number;
}

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export type ChartType = 'line' | 'candle' | 'area' | 'bar';

export interface ChartIndicator {
  id: string;
  name: string;
  type: 'overlay' | 'separate';
  parameters: Record<string, any>;
  visible: boolean;
  color: string;
}

export interface ChartTemplate {
  id: string;
  name: string;
  timeframe: ChartTimeframe;
  indicators: ChartIndicator[];
  tradingPairs: string[];
  createdAt: number;
  updatedAt: number;
}