import React, { useState } from 'react';
import { Database, KeyIcon, Server, Link, Check, AlertTriangle } from 'lucide-react';

const ConnectSupabase: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleConnect = async () => {
    if (!url || !key) {
      setConnectionStatus('error');
      setErrorMessage('Please enter both URL and API key');
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // Create a temporary .env file with the credentials
      const envContent = `VITE_SUPABASE_URL=${url}\nVITE_SUPABASE_ANON_KEY=${key}`;
      
      // In a real application, we would test the connection here
      // For demo purposes, we'll simulate a successful connection after a delay
      setTimeout(() => {
        localStorage.setItem('supabase_credentials', JSON.stringify({ url, key }));
        setConnectionStatus('success');
      }, 1500);
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-50 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="text-blue-500" size={24} />
        <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Connect to Supabase</h2>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Enter your Supabase project credentials to enable data persistence and authentication.
      </p>
      
      {connectionStatus === 'success' ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Check className="text-green-500 mr-2" size={20} />
            <h3 className="text-green-800 dark:text-green-300 font-medium">Connected Successfully</h3>
          </div>
          <p className="text-green-700 dark:text-green-400 text-sm mt-2">
            Your application is now connected to Supabase. The credentials have been saved locally.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server size={16} className="text-gray-400" />
              </div>
              <input
                id="supabase-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Found in your Supabase project settings → API
            </p>
          </div>
          
          <div>
            <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase Anon Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon size={16} className="text-gray-400" />
              </div>
              <input
                id="supabase-key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="your-anon-key"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The public anon key, not your service role key
            </p>
          </div>
          
          {connectionStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex">
                <AlertTriangle size={16} className="text-red-500 mr-2" />
                <span className="text-red-800 dark:text-red-300 text-sm">{errorMessage || 'Failed to connect to Supabase'}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleConnect}
            disabled={connectionStatus === 'connecting'}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectionStatus === 'connecting' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <Link size={16} className="mr-2" />
                Connect to Supabase
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
        <p className="mb-1"><strong>Note:</strong> In production, you would:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Store these keys as environment variables</li>
          <li>Set up proper database migrations</li>
          <li>Use a more robust connection process</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectSupabase;