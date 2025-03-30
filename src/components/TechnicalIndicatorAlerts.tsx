import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  Activity, 
  TrendingUp,
  TrendingDown,
  Crosshair,
  Percent,
  BarChart2,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface TechnicalIndicatorAlertFormData {
  asset: string;
  indicatorType: string;
  parameters: Record<string, any>;
  timeframe: string;
  notificationType: 'app' | 'email' | 'both';
  notes?: string;
}

const TechnicalIndicatorAlerts: React.FC = () => {
  const { addAlert } = useAlerts();
  const [formData, setFormData] = useState<TechnicalIndicatorAlertFormData>({
    asset: 'BTC',
    indicatorType: 'ma_crossover',
    parameters: {
      fastMA: 50,
      slowMA: 200,
      direction: 'bullish',
    },
    timeframe: '1d',
    notificationType: 'app',
    notes: '',
  });

  // List of available indicators
  const indicators = [
    { 
      id: 'ma_crossover', 
      name: 'Moving Average Crossover', 
      icon: <Crosshair size={16} />,
      description: 'Alert when fast MA crosses above or below slow MA'
    },
    { 
      id: 'rsi', 
      name: 'RSI Overbought/Oversold', 
      icon: <Activity size={16} />,
      description: 'Alert when RSI enters overbought or oversold territory'
    },
    { 
      id: 'macd', 
      name: 'MACD Signal Crossover', 
      icon: <TrendingUp size={16} />,
      description: 'Alert when MACD line crosses the signal line'
    },
    { 
      id: 'volume_profile', 
      name: 'Volume Profile Anomaly', 
      icon: <BarChart2 size={16} />,
      description: 'Alert on unusual volume patterns'
    },
    { 
      id: 'pattern', 
      name: 'Chart Pattern Detection', 
      icon: <TrendingDown size={16} />,
      description: 'Alert when specific chart patterns form'
    },
  ];

  // Available timeframes
  const timeframes = [
    { id: '15m', name: '15 minutes' },
    { id: '1h', name: '1 hour' },
    { id: '4h', name: '4 hours' },
    { id: '1d', name: '1 day' },
    { id: '1w', name: '1 week' },
  ];

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle parameter changes based on indicator type
  const handleParameterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [name]: value,
      },
    });
  };

  // Handle indicator type selection
  const handleIndicatorChange = (indicatorType: string) => {
    // Set default parameters based on indicator type
    let parameters = {};
    
    switch (indicatorType) {
      case 'ma_crossover':
        parameters = {
          fastMA: 50,
          slowMA: 200,
          direction: 'bullish',
        };
        break;
      case 'rsi':
        parameters = {
          period: 14,
          overbought: 70,
          oversold: 30,
          condition: 'oversold',
        };
        break;
      case 'macd':
        parameters = {
          fastEMA: 12,
          slowEMA: 26,
          signalPeriod: 9,
          direction: 'bullish',
        };
        break;
      case 'volume_profile':
        parameters = {
          lookbackPeriod: 20,
          deviationThreshold: 200,
        };
        break;
      case 'pattern':
        parameters = {
          patternType: 'double_bottom',
          confirmationNeeded: true,
        };
        break;
      default:
        parameters = {};
    }
    
    setFormData({
      ...formData,
      indicatorType,
      parameters,
    });
  };

  // Render parameter form fields based on indicator type
  const renderParameterFields = () => {
    switch (formData.indicatorType) {
      case 'ma_crossover':
        return (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fast MA Period
                </label>
                <input
                  type="number"
                  name="fastMA"
                  value={formData.parameters.fastMA}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slow MA Period
                </label>
                <input
                  type="number"
                  name="slowMA"
                  value={formData.parameters.slowMA}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crossover Direction
                </label>
                <select
                  name="direction"
                  value={formData.parameters.direction}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bullish">Bullish (Fast crosses above Slow)</option>
                  <option value="bearish">Bearish (Fast crosses below Slow)</option>
                  <option value="both">Both Directions</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'rsi':
        return (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RSI Period
                </label>
                <input
                  type="number"
                  name="period"
                  value={formData.parameters.period}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overbought Threshold
                </label>
                <input
                  type="number"
                  name="overbought"
                  value={formData.parameters.overbought}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oversold Threshold
                </label>
                <input
                  type="number"
                  name="oversold"
                  value={formData.parameters.oversold}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Condition
                </label>
                <select
                  name="condition"
                  value={formData.parameters.condition}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="overbought">Overbought (RSI above threshold)</option>
                  <option value="oversold">Oversold (RSI below threshold)</option>
                  <option value="both">Both Conditions</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'macd':
        return (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fast EMA Period
                </label>
                <input
                  type="number"
                  name="fastEMA"
                  value={formData.parameters.fastEMA}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slow EMA Period
                </label>
                <input
                  type="number"
                  name="slowEMA"
                  value={formData.parameters.slowEMA}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signal Line Period
                </label>
                <input
                  type="number"
                  name="signalPeriod"
                  value={formData.parameters.signalPeriod}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crossover Direction
                </label>
                <select
                  name="direction"
                  value={formData.parameters.direction}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bullish">Bullish (MACD crosses above Signal)</option>
                  <option value="bearish">Bearish (MACD crosses below Signal)</option>
                  <option value="both">Both Directions</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'volume_profile':
        return (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lookback Period (days)
                </label>
                <input
                  type="number"
                  name="lookbackPeriod"
                  value={formData.parameters.lookbackPeriod}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deviation Threshold (%)
                </label>
                <input
                  type="number"
                  name="deviationThreshold"
                  value={formData.parameters.deviationThreshold}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when volume exceeds normal levels by this percentage
                </p>
              </div>
            </div>
          </>
        );
      
      case 'pattern':
        return (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern Type
                </label>
                <select
                  name="patternType"
                  value={formData.parameters.patternType}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="double_bottom">Double Bottom</option>
                  <option value="double_top">Double Top</option>
                  <option value="head_shoulders">Head and Shoulders</option>
                  <option value="inv_head_shoulders">Inverse Head and Shoulders</option>
                  <option value="triangle">Triangle</option>
                  <option value="wedge">Wedge</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation Required
                </label>
                <select
                  name="confirmationNeeded"
                  value={formData.parameters.confirmationNeeded.toString()}
                  onChange={handleParameterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Yes (more reliable but may alert later)</option>
                  <option value="false">No (may have false positives)</option>
                </select>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a message based on indicator type
    let message = '';
    
    switch (formData.indicatorType) {
      case 'ma_crossover':
        message = `${formData.asset} ${formData.parameters.fastMA}-period MA crosses ${
          formData.parameters.direction === 'bullish' ? 'above' : 
          formData.parameters.direction === 'bearish' ? 'below' : 
          'above/below'
        } ${formData.parameters.slowMA}-period MA on ${formData.timeframe} timeframe`;
        break;
      
      case 'rsi':
        message = `${formData.asset} RSI(${formData.parameters.period}) ${
          formData.parameters.condition === 'overbought' ? `exceeds ${formData.parameters.overbought}` : 
          formData.parameters.condition === 'oversold' ? `falls below ${formData.parameters.oversold}` : 
          `exceeds ${formData.parameters.overbought} or falls below ${formData.parameters.oversold}`
        } on ${formData.timeframe} timeframe`;
        break;
      
      case 'macd':
        message = `${formData.asset} MACD(${formData.parameters.fastEMA},${formData.parameters.slowEMA},${formData.parameters.signalPeriod}) line crosses ${
          formData.parameters.direction === 'bullish' ? 'above' : 
          formData.parameters.direction === 'bearish' ? 'below' : 
          'above/below'
        } signal line on ${formData.timeframe} timeframe`;
        break;
      
      case 'volume_profile':
        message = `${formData.asset} volume exceeds ${formData.parameters.deviationThreshold}% of normal levels (${formData.parameters.lookbackPeriod}-day average) on ${formData.timeframe} timeframe`;
        break;
      
      case 'pattern':
        message = `${formData.asset} forms a ${formData.parameters.patternType.replace('_', ' ')} pattern ${
          formData.parameters.confirmationNeeded ? 'with confirmation' : 'without confirmation'
        } on ${formData.timeframe} timeframe`;
        break;
    }
    
    // Add the indicator alert
    addAlert({
      asset: formData.asset,
      condition: 'technical',
      value: 0, // Not applicable for technical alerts
      active: true,
      repeat: true,
      notificationType: formData.notificationType,
      notes: formData.notes,
      // Add additional properties for technical indicator alerts
      technicalIndicator: {
        type: formData.indicatorType,
        parameters: formData.parameters,
        timeframe: formData.timeframe,
        message,
      },
    });

    // Show confirmation
    alert(`Technical indicator alert created: ${message}`);
    
    // Reset form to default state
    setFormData({
      asset: 'BTC',
      indicatorType: 'ma_crossover',
      parameters: {
        fastMA: 50,
        slowMA: 200,
        direction: 'bullish',
      },
      timeframe: '1d',
      notificationType: 'app',
      notes: '',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">Technical Indicator Alerts</h2>
        <p className="text-sm text-gray-600">
          Create alerts based on technical indicators and chart patterns. These alerts will notify you when specific technical conditions are met.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset
          </label>
          <input
            type="text"
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="BTC, ETH, etc."
            required
          />
        </div>
        
        {/* Indicator Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indicator Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {indicators.map((indicator) => (
              <button
                key={indicator.id}
                type="button"
                className={`flex items-center justify-start p-2 border rounded-md ${
                  formData.indicatorType === indicator.id
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleIndicatorChange(indicator.id)}
              >
                <span className="p-1 mr-2 bg-blue-100 rounded-md text-blue-600">
                  {indicator.icon}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{indicator.name}</span>
                  <span className="text-xs text-gray-500">{indicator.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Timeframe Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeframe
          </label>
          <select
            name="timeframe"
            value={formData.timeframe}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Indicator Parameters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Indicator Parameters
          </h3>
          {renderParameterFields()}
        </div>
        
        {/* Notification Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <select
            name="notificationType"
            value={formData.notificationType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="app">In-App</option>
            <option value="email">Email</option>
            <option value="both">Both</option>
          </select>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes or reminders about this alert"
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} className="inline mr-1" />
            Create Technical Alert
          </button>
        </div>
      </form>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-yellow-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
            <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside space-y-1">
              <li>Technical indicator alerts are calculated based on historical data and may not predict future market movements</li>
              <li>Alerts may be delayed by up to 5 minutes depending on market conditions</li>
              <li>Consider using multiple indicators for confirmation of signals</li>
              <li>Configure your notification preferences in settings to ensure delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicatorAlerts;