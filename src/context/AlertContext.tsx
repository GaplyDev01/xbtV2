import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

export type AlertCondition = 'above' | 'below' | 'percent-change' | 'volume-spike' | 'technical' | 'on-chain';

export interface TechnicalIndicatorParams {
  type: string;
  parameters: Record<string, any>;
  timeframe: string;
  message: string;
}

export interface OnChainMetricParams {
  type: string;
  parameters: Record<string, any>;
  network: string;
  message: string;
}

export interface Alert {
  id: string;
  asset: string;
  condition: AlertCondition;
  value: number;
  active: boolean;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
  repeat?: boolean;
  notificationType: 'app' | 'email' | 'both';
  notes?: string;
  technicalIndicator?: TechnicalIndicatorParams;
  onChainMetric?: OnChainMetricParams;
}

export interface Notification {
  id: string;
  alertId?: string;
  type: 'alert' | 'system' | 'price';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  importance: 'low' | 'medium' | 'high';
}

interface AlertContextType {
  alerts: Alert[];
  notifications: Notification[];
  unreadCount: number;
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  triggerAlert: (alertId: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Subscribe to alerts and notifications when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Create channels
    const alertsChannel = supabase.channel('alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [...prev, payload.new as Alert]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(alert => 
              alert.id === payload.new.id ? payload.new as Alert : alert
            ));
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase.channel('notifications-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(notification => 
              notification.id === payload.new.id ? payload.new as Notification : notification
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(notification => notification.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Initial fetch of alerts and notifications
    const fetchData = async () => {
      const [alertsResponse, notificationsResponse] = await Promise.all([
        supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
      ]);

      if (alertsResponse.error) {
        console.error('Error fetching alerts:', alertsResponse.error);
      } else {
        setAlerts(alertsResponse.data || []);
      }

      if (notificationsResponse.error) {
        console.error('Error fetching notifications:', notificationsResponse.error);
      } else {
        setNotifications(notificationsResponse.data || []);
      }
    };

    fetchData();

    // Cleanup subscriptions
    return () => {
      alertsChannel.unsubscribe();
      notificationsChannel.unsubscribe();
    };
  }, [user]);

  // Calculate unread notifications count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const addAlert = async (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          ...alert,
          user_id: user.id,
          created_at: new Date().toISOString(),
          triggered: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Create notification for new alert
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'system',
          title: 'New Alert Created',
          message: `Alert for ${alert.asset} ${alert.condition} ${alert.value} has been created.`,
          importance: 'low',
          read: false,
          timestamp: new Date().toISOString()
        }]);

    } catch (err) {
      console.error('Error creating alert:', err);
      throw err;
    }
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating alert:', err);
      throw err;
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting alert:', err);
      throw err;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      throw err;
    }
  };

  const triggerAlert = async (alertId: string) => {
    if (!user) return;

    try {
      // Find the alert
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      // Update the alert
      await supabase
        .from('alerts')
        .update({
          triggered: true,
          triggered_at: new Date().toISOString(),
          active: alert.repeat ? true : false
        })
        .eq('id', alertId)
        .eq('user_id', user.id);

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'alert',
          alert_id: alertId,
          title: 'Alert Triggered',
          message: `Your alert for ${alert.asset} ${alert.condition} ${alert.value} has been triggered.`,
          importance: 'high',
          read: false,
          timestamp: new Date().toISOString()
        }]);
    } catch (err) {
      console.error('Error triggering alert:', err);
      throw err;
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        notifications,
        unreadCount,
        addAlert,
        updateAlert,
        deleteAlert,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        deleteAllNotifications,
        triggerAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};