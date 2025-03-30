import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { useCrypto } from '../../context/CryptoContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Loader2, ExternalLink, AlertTriangle, GitPullRequest, GitCommit, Star, Users, Code } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DeveloperActivity: React.FC = () => {
  const { selectedToken } = useToken();
  const { getTokenDeveloperData, getTokenRepoStats, getTokenStatusUpdates } = useCrypto();
  const [devData, setDevData] = useState<any>(null);
  const [repoData, setRepoData] = useState<any[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedToken) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [developerData, repositoryData, updates] = await Promise.all([
          getTokenDeveloperData(selectedToken.id),
          getTokenRepoStats(selectedToken.id),
          getTokenStatusUpdates(selectedToken.id, 1, 5)
        ]);
        
        setDevData(developerData);
        setRepoData(Array.isArray(repositoryData) ? repositoryData : []);
        setStatusUpdates(updates || []);
      } catch (err) {
        console.error('Error fetching developer data:', err);
        setError('Failed to load developer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedToken, getTokenDeveloperData, getTokenRepoStats, getTokenStatusUpdates]);

  // Prepare chart data for commit activity
  const prepareChartData = () => {
    if (!devData?.last_4_weeks_commit_activity_series) return null;
    
    const commitData = devData.last_4_weeks_commit_activity_series;
    
    // Generate labels for the last 4 weeks
    const labels = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.getDate().toString());
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Commits',
          data: commitData,
          borderColor: 'rgb(var(--theme-accent))',
          backgroundColor: 'rgba(var(--theme-accent), 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgb(var(--theme-bg))',
        borderColor: 'rgb(var(--theme-border))',
        borderWidth: 1,
        titleColor: 'rgb(var(--theme-text-primary))',
        bodyColor: 'rgb(var(--theme-text-secondary))',
        padding: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(var(--theme-border), 0.1)'
        },
        ticks: {
          color: 'rgb(var(--theme-text-secondary))'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(var(--theme-text-secondary))'
        }
      }
    }
  };

  // Format numbers for better display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="text-theme-accent animate-spin" />
          <span className="ml-2 text-theme-text-secondary">Loading developer data...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-theme-text-secondary">
          <AlertTriangle size={24} className="mx-auto mb-2 text-theme-accent" />
          <p>{error}</p>
        </div>
      ) : devData ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-theme-accent/10 p-3 rounded">
              <div className="flex items-center mb-1">
                <Star size={14} className="text-theme-accent mr-1" />
                <div className="text-xs text-theme-text-secondary">Stars</div>
              </div>
              <div className="text-lg font-semibold">{formatNumber(devData.stars)}</div>
            </div>
            <div className="bg-theme-accent/10 p-3 rounded">
              <div className="flex items-center mb-1">
                <GitPullRequest size={14} className="text-theme-accent mr-1" />
                <div className="text-xs text-theme-text-secondary">Pull Requests</div>
              </div>
              <div className="text-lg font-semibold">{formatNumber(devData.pull_requests_merged)}</div>
            </div>
            <div className="bg-theme-accent/10 p-3 rounded">
              <div className="flex items-center mb-1">
                <Users size={14} className="text-theme-accent mr-1" />
                <div className="text-xs text-theme-text-secondary">Contributors</div>
              </div>
              <div className="text-lg font-semibold">{formatNumber(devData.pull_request_contributors)}</div>
            </div>
            <div className="bg-theme-accent/10 p-3 rounded">
              <div className="flex items-center mb-1">
                <GitCommit size={14} className="text-theme-accent mr-1" />
                <div className="text-xs text-theme-text-secondary">Commits (4w)</div>
              </div>
              <div className="text-lg font-semibold">{formatNumber(devData.commit_count_4_weeks)}</div>
            </div>
          </div>
          
          {/* Commit Activity Chart */}
          <div className="h-60 mb-4 bg-theme-accent/10 p-3 rounded">
            {prepareChartData() ? (
              <Line data={prepareChartData()} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-theme-text-secondary">
                No commit data available
              </div>
            )}
          </div>
          
          {/* Repositories */}
          {repoData.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Active Repositories</h3>
              <div className="space-y-2">
                {repoData.slice(0, 3).map((repo, index) => (
                  <div key={index} className="bg-theme-accent/10 p-3 rounded">
                    <div className="flex justify-between">
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-theme-accent hover:underline flex items-center"
                      >
                        <Code size={14} className="mr-1" />
                        {repo.name}
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                      <div className="text-xs text-theme-text-secondary">
                        ⭐ {repo.stars} 🍴 {repo.forks}
                      </div>
                    </div>
                    {repo.organization && (
                      <div className="text-xs text-theme-text-secondary mt-1">
                        {repo.organization}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Updates */}
          {statusUpdates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Recent Updates</h3>
              <div className="space-y-2">
                {statusUpdates.map((update, index) => (
                  <div key={index} className="bg-theme-accent/10 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">{update.category}</div>
                      <div className="text-xs text-theme-text-secondary">
                        {new Date(update.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm">{update.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-theme-text-secondary">
          <p>No developer data available for this token</p>
        </div>
      )}
    </div>
  );
};

export default DeveloperActivity;