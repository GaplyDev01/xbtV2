import React, { useState, useEffect } from 'react';
import { useAlerts } from '../context/AlertContext';
import Card from './Card';
import TechnicalIndicatorAlerts from './TechnicalIndicatorAlerts';
import { 
  Bell, 
  ArrowUp, 
  ArrowDown, 
  Activity,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlarmClock,
  AlertTriangle,
  X,
  Calendar,
  Clock,
  BarChart2,
  Database
} from 'lucide-react';
import { formatCurrency } from '../utils/chartUtils';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Alert creation modal
interface CreateAlertModalProps {
  onClose: () => void;
  onSave: (alert: Omit<AlertType, 'id' | 'createdAt' | 'triggered'>) => void;
}

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({ onClose, onSave }) => {
  const [asset, setAsset] = useState('BTC');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [value, setValue] = useState<number>(50000);
  const [active, setActive] = useState<boolean>(true);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<'app' | 'email' | 'both'>('app');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      asset,
      condition,
      value,
      active,
      repeat,
      notificationType,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-theme-bg/50 flex items-center justify-center z-50">
      <div className="bg-theme-bg rounded-lg shadow-xl p-6 max-w-md w-full border border-theme-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-theme-text-primary">Create New Alert</h3>
          <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Asset
            </label>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
              placeholder="BTC, ETH, etc."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                  condition === 'above' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-accent'
                }`}
                onClick={() => setCondition('above')}
              >
                <ArrowUp size={14} className="mr-1" />
                Price above
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                  condition === 'below' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-accent'
                }`}
                onClick={() => setCondition('below')}
              >
                <ArrowDown size={14} className="mr-1" />
                Price below
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                  condition === 'percent-change' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-accent'
                }`}
                onClick={() => setCondition('percent-change')}
              >
                <Activity size={14} className="mr-1" />
                Percent change
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md ${
                  condition === 'volume-spike' 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-accent/10 text-theme-accent'
                }`}
                onClick={() => setCondition('volume-spike')}
              >
                <Activity size={14} className="mr-1" />
                Volume spike
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              {condition === 'above' || condition === 'below' 
                ? 'Price Value' 
                : condition === 'percent-change' 
                  ? 'Percentage Change (%)' 
                  : 'Volume Increase (%)'}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
              step={condition === 'above' || condition === 'below' ? '0.01' : '0.1'}
              min="0"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Notification Type
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as 'app' | 'email' | 'both')}
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
            >
              <option value="app">In-App</option>
              <option value="email">Email</option>
              <option value="both">Both</option>
            </select>
          </div>
          
          <div className="mb-4 space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm text-theme-text-primary">
                Active
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="repeat"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="repeat" className="text-sm text-theme-text-primary">
                Repeat alert when triggered again
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text-primary mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-theme-bg border border-theme-border rounded-md text-sm text-theme-text-primary"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-theme-border rounded-md text-theme-text-primary hover:bg-theme-accent/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-theme-accent rounded-md text-theme-bg hover:bg-theme-accent-dark"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Alert card component
interface AlertCardProps {
  alert: AlertType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className={`border rounded-lg overflow-hidden ${
      alert.triggered ? 'bg-theme-accent/10 border-theme-accent' : 'bg-theme-bg border-theme-border'
    }`}>
      <div className="px-4 py-3 flex justify-between items-center border-b border-theme-border">
        <div className="flex items-center">
          {alert.condition === 'above' && <ArrowUp size={16} className="text-theme-accent mr-2" />}
          {alert.condition === 'below' && <ArrowDown size={16} className="text-theme-accent mr-2" />}
          {alert.condition === 'percent-change' && <Activity size={16} className="text-theme-accent mr-2" />}
          {alert.condition === 'volume-spike' && <Activity size={16} className="text-theme-accent mr-2" />}
          {alert.condition === 'technical' && <BarChart2 size={16} className="text-theme-accent mr-2" />}
          {alert.condition === 'on-chain' && <Database size={16} className="text-theme-accent mr-2" />}
          <span className="font-medium text-sm text-theme-text-primary">{alert.asset}</span>
          {alert.triggered && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-theme-accent/20 text-theme-accent rounded-full">
              Triggered
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onToggleActive(alert.id, !alert.active)}
            className={`p-1 rounded ${
              alert.active ? 'text-theme-accent hover:text-theme-accent-dark' : 'text-theme-text-secondary hover:text-theme-text-primary'
            }`}
            title={alert.active ? 'Deactivate alert' : 'Activate alert'}
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => onEdit(alert.id)}
            className="p-1 text-theme-accent hover:text-theme-accent-dark rounded"
            title="Edit alert"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1 text-theme-accent hover:text-theme-accent-dark rounded"
            title="Delete alert"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="mb-2">
          <div className="text-xs text-theme-text-secondary mb-1">Condition</div>
          <div className="text-sm text-theme-text-primary">
            {alert.condition === 'above' && `Price above ${formatCurrency(alert.value)}`}
            {alert.condition === 'below' && `Price below ${formatCurrency(alert.value)}`}
            {alert.condition === 'percent-change' && `Price changes by ${alert.value}%`}
            {alert.condition === 'volume-spike' && `Volume increases by ${alert.value}%`}
            {alert.condition === 'technical' && alert.technicalIndicator && alert.technicalIndicator.message}
            {alert.condition === 'on-chain' && alert.onChainMetric && alert.onChainMetric.message}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-xs text-theme-text-secondary mb-1">Created</div>
            <div className="text-xs text-theme-text-primary">
              {new Date(alert.createdAt).toLocaleDateString()}
            </div>
          </div>
          {alert.triggered && alert.triggeredAt && (
            <div>
              <div className="text-xs text-theme-text-secondary mb-1">Triggered</div>
              <div className="text-xs text-theme-text-primary">
                {new Date(alert.triggeredAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
        
        {alert.notes && (
          <div className="text-xs text-theme-text-secondary border-t border-theme-border pt-2 mt-2">
            {alert.notes}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Alerts component
const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications' | 'technical' | 'on-chain'>('alerts');
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');

  // Fetch alerts from Supabase
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);

        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (alertsError) throw alertsError;

        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (notificationsError) throw notificationsError;

        setAlerts(alertsData || []);
        setNotifications(notificationsData || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Subscribe to real-time updates
    const alertsSubscription = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'alerts',
        filter: `user_id=eq.${user?.id}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new as AlertType, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(alert => 
            alert.id === payload.new.id ? payload.new as AlertType : alert
          ));
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      alertsSubscription.unsubscribe();
    };
  }, [user]);

  // Filter alerts based on selected filter
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.active && !alert.triggered;
    if (filter === 'triggered') return alert.triggered;
    return true;
  });

  // Handle alert creation
  const handleCreateAlert = async (alertData: Omit<AlertType, 'id' | 'createdAt' | 'triggered'>) => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          ...alertData,
          user_id: user?.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Failed to create alert. Please try again.');
    }
  };

  // Handle alert deletion
  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert. Please try again.');
    }
  };

  // Handle alert toggle
  const handleToggleAlert = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ active })
        .eq('id', id);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, active } : alert
      ));
    } catch (err) {
      console.error('Error toggling alert:', err);
      setError('Failed to update alert. Please try again.');
    }
  };

  // Handle notification actions
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications([]);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-theme-text-primary">Alerts & Notifications</h2>
            <p className="text-sm text-theme-accent">Stay updated on market movements</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`flex items-center text-xs px-3 py-2 rounded-lg ${
                activeTab === 'alerts' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell size={14} className="mr-1" />
              Price Alerts
              <span className="ml-1 text-[10px] px-1.5 rounded-full bg-theme-accent/20 text-theme-accent">
                {alerts.filter(a => a.condition !== 'technical' && a.condition !== 'on-chain').length}
              </span>
            </button>
            <button
              className={`flex items-center text-xs px-3 py-2 rounded-lg ${
                activeTab === 'technical' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('technical')}
            >
              <BarChart2 size={14} className="mr-1" />
              Technical
              <span className="ml-1 text-[10px] px-1.5 rounded-full bg-theme-accent/20 text-theme-accent">
                {alerts.filter(a => a.condition === 'technical').length}
              </span>
            </button>
            <button
              className={`flex items-center text-xs px-3 py-2 rounded-lg ${
                activeTab === 'on-chain' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('on-chain')}
            >
              <Database size={14} className="mr-1" />
              On-Chain
              <span className="ml-1 text-[10px] px-1.5 rounded-full bg-theme-accent/20 text-theme-accent">
                {alerts.filter(a => a.condition === 'on-chain').length}
              </span>
            </button>
            <button
              className={`flex items-center text-xs px-3 py-2 rounded-lg ${
                activeTab === 'notifications' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={14} className="mr-1" />
              Notifications
              <span className="ml-1 text-[10px] px-1.5 rounded-full bg-theme-accent/20 text-theme-accent">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'alerts' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  className={`text-xs px-3 py-1 rounded-lg ${
                    filter === 'all' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-lg ${
                    filter === 'active' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'
                  }`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`text-xs px-3 py-1 rounded-lg ${
                    filter === 'triggered' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'
                  }`}
                  onClick={() => setFilter('triggered')}
                >
                  Triggered
                </button>
              </div>
              
              <button 
                className="flex items-center text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg"
                onClick={() => {
                  setEditingAlertId(null);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} className="mr-1" />
                Create Alert
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={24} className="text-theme-accent animate-spin mr-2" />
                <span className="text-theme-text-secondary">Loading alerts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : filteredAlerts.filter(a => a.condition !== 'technical' && a.condition !== 'on-chain').length === 0 ? (
              <div className="text-center py-10">
                <Bell size={40} className="text-theme-accent/20 mx-auto mb-2" />
                <p className="text-sm text-theme-text-secondary mb-4">
                  No price alerts found. Create a new alert to be notified of price movements.
                </p>
                <button 
                  className="inline-flex items-center text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg"
                  onClick={() => {
                    setEditingAlertId(null);
                    setShowCreateModal(true);
                  }}
                >
                  <Plus size={14} className="mr-1" />
                  Create Alert
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlerts
                  .filter(a => a.condition !== 'technical' && a.condition !== 'on-chain')
                  .map(alert => (
                    <AlertCard 
                      key={alert.id}
                      alert={alert}
                      onEdit={setEditingAlertId}
                      onDelete={handleDeleteAlert}
                      onToggleActive={handleToggleAlert}
                    />
                  ))
                }
              </div>
            )}
          </>
        ) : activeTab === 'technical' ? (
          <TechnicalIndicatorAlerts />
        ) : activeTab === 'on-chain' ? (
          <div className="text-center py-10">
            <Database size={40} className="text-theme-accent/20 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-theme-text-primary mb-2">On-Chain Alerts</h3>
            <p className="text-sm text-theme-text-secondary mb-4">
              On-chain alerts are coming soon. These will allow you to monitor blockchain activity such as large transactions, 
              whale movements, and smart contract interactions.
            </p>
            <div className="inline-flex items-center text-xs bg-theme-bg border border-theme-border text-theme-text-primary px-4 py-2 rounded-lg">
              <AlertTriangle size={14} className="mr-1 text-theme-accent" />
              Coming Soon
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-theme-text-primary">
                Notifications ({notifications.filter(n => !n.read).length} unread)
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-xs px-3 py-1 bg-theme-accent/10 text-theme-accent rounded-lg hover:bg-theme-accent/20"
                  onClick={markAllNotificationsAsRead}
                >
                  Mark All as Read
                </button>
                <button 
                  className="text-xs px-3 py-1 bg-theme-accent/10 text-theme-accent rounded-lg hover:bg-theme-accent/20"
                  onClick={deleteAllNotifications}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={40} className="text-theme-accent/20 mx-auto mb-2" />
                <p className="text-sm text-theme-text-secondary">
                  No notifications yet. They will appear here when your alerts are triggered.
                </p>
              </div>
            ) : (
              <div className="bg-theme-bg rounded-lg border border-theme-border overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`border-b border-theme-border p-3 hover:bg-theme-accent/10 cursor-pointer ${
                        !notification.read ? 'bg-theme-accent/5' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className={`mt-1 w-2 h-2 rounded-full mr-2 ${
                          notification.importance === 'high' ? 'bg-theme-accent' : 
                          notification.importance === 'medium' ? 'bg-theme-accent/80' : 
                          'bg-theme-accent/60'
                        }`}></div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-medium text-theme-text-primary">{notification.title}</h4>
                          <p className="text-xs text-theme-text-secondary">{notification.message}</p>
                          <p className="text-[10px] text-theme-text-secondary mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {showCreateModal && (
        <CreateAlertModal 
          onClose={() => {
            setShowCreateModal(false);
            setEditingAlertId(null);
          }}
          onSave={handleCreateAlert}
        />
      )}
    </div>
  );
};

export default Alerts;