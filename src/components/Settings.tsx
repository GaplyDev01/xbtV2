import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import { supabase } from '../utils/supabase';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import CanonicalLink from './CanonicalLink';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications } = useAlerts();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [portfolioAlerts, setPortfolioAlerts] = useState(true);
  
  // Theme settings
  const [accentColor, setAccentColor] = useState('#00d69e');
  const [customTheme, setCustomTheme] = useState(false);

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setDisplayName(profile.display_name || '');
          setAvatar(profile.avatar_url);
          setTwoFactorEnabled(profile.two_factor_enabled || false);
          setEmailNotifications(profile.email_notifications !== false);
          setPushNotifications(profile.push_notifications !== false);
          setPriceAlerts(profile.price_alerts !== false);
          setNewsAlerts(profile.news_alerts !== false);
          setPortfolioAlerts(profile.portfolio_alerts !== false);
          setCustomTheme(profile.custom_theme || false);
          setAccentColor(profile.accent_color || '#00d69e');
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError('Failed to load user settings');
      }
    };

    loadUserSettings();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          price_alerts: priceAlerts,
          news_alerts: newsAlerts,
          portfolio_alerts: portfolioAlerts,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Notification preferences updated');
    } catch (err) {
      console.error('Error updating notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTheme = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update theme context first
      if (customTheme) {
        setAccentColor(accentColor);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          custom_theme: customTheme,
          accent_color: accentColor,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Theme preferences updated');
    } catch (err) {
      console.error('Error updating theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to update theme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CanonicalLink path="/settings" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                <SettingsIcon size={24} className="mr-2 text-theme-accent" />
                Settings
              </h2>
              <p className="text-sm text-theme-accent">Customize your experience</p>
            </div>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile" className="text-sm">
                <User size={16} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="text-sm">
                <Shield size={16} className="mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-sm">
                <Bell size={16} className="mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="text-sm">
                <Palette size={16} className="mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <div className="space-y-4">
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <h3 className="text-lg font-medium text-theme-text-primary mb-4">Profile Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-primary"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-secondary"
                      />
                    </div>

                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-4">
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <h3 className="text-lg font-medium text-theme-text-primary mb-4">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary hover:text-theme-text-primary"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary hover:text-theme-text-primary"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary hover:text-theme-text-primary"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdatePassword}
                      disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                      className="px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary">Two-Factor Authentication</h3>
                      <p className="text-sm text-theme-text-secondary mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm mr-2 ${twoFactorEnabled ? 'text-green-500' : 'text-theme-text-secondary'}`}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          twoFactorEnabled ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <h3 className="text-lg font-medium text-theme-text-primary mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-theme-text-primary">Email Notifications</h4>
                        <p className="text-xs text-theme-text-secondary">Receive important updates via email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailNotifications ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-theme-text-primary">Push Notifications</h4>
                        <p className="text-xs text-theme-text-secondary">Get real-time alerts on your device</p>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pushNotifications ? 'bg-theme-accent' : 'bg-theme-border'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="border-t border-theme-border pt-4">
                      <h4 className="text-sm font-medium text-theme-text-primary mb-3">Alert Types</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm text-theme-text-primary">Price Alerts</h5>
                            <p className="text-xs text-theme-text-secondary">Token price movements</p>
                          </div>
                          <button
                            onClick={() => setPriceAlerts(!priceAlerts)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              priceAlerts ? 'bg-theme-accent' : 'bg-theme-border'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                priceAlerts ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm text-theme-text-primary">News Alerts</h5>
                            <p className="text-xs text-theme-text-secondary">Important news and updates</p>
                          </div>
                          <button
                            onClick={() => setNewsAlerts(!newsAlerts)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              newsAlerts ? 'bg-theme-accent' : 'bg-theme-border'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                newsAlerts ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm text-theme-text-primary">Portfolio Alerts</h5>
                            <p className="text-xs text-theme-text-secondary">Changes in your portfolio</p>
                          </div>
                          <button
                            onClick={() => setPortfolioAlerts(!portfolioAlerts)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              portfolioAlerts ? 'bg-theme-accent' : 'bg-theme-border'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                portfolioAlerts ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateNotifications}
                      disabled={loading}
                      className="px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        'Save Notification Settings'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <div className="space-y-4">
                <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
                  <h3 className="text-lg font-medium text-theme-text-primary mb-4">Theme Settings</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 bg-theme-bg border rounded-lg text-center transition-colors ${
                        theme === 'light' 
                          ? 'border-theme-accent' 
                          : 'border-theme-border hover:border-theme-accent'
                      }`}
                    >
                      <Sun size={24} className="mx-auto mb-2 text-theme-accent" />
                      <div className="text-sm font-medium text-theme-text-primary">Light</div>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 bg-theme-bg border rounded-lg text-center transition-colors ${
                        theme === 'dark' 
                          ? 'border-theme-accent' 
                          : 'border-theme-border hover:border-theme-accent'
                      }`}
                    >
                      <Moon size={24} className="mx-auto mb-2 text-theme-accent" />
                      <div className="text-sm font-medium text-theme-text-primary">Dark</div>
                    </button>

                    <button
                      onClick={() => setTheme('high-contrast-light')}
                      className={`p-4 bg-theme-bg border rounded-lg text-center transition-colors ${
                        theme === 'high-contrast-light' 
                          ? 'border-theme-accent' 
                          : 'border-theme-border hover:border-theme-accent'
                      }`}
                    >
                      <Sun size={24} className="mx-auto mb-2 text-theme-accent" />
                      <div className="text-sm font-medium text-theme-text-primary">High Contrast Light</div>
                    </button>

                    <button
                      onClick={() => setTheme('high-contrast-dark')}
                      className={`p-4 bg-theme-bg border rounded-lg text-center transition-colors ${
                        theme === 'high-contrast-dark' 
                          ? 'border-theme-accent' 
                          : 'border-theme-border hover:border-theme-accent'
                      }`}
                    >
                      <Moon size={24} className="mx-auto mb-2 text-theme-accent" />
                      <div className="text-sm font-medium text-theme-text-primary">High Contrast Dark</div>
                    </button>

                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 bg-theme-bg border rounded-lg text-center transition-colors ${
                        theme === 'system' 
                          ? 'border-theme-accent' 
                          : 'border-theme-border hover:border-theme-accent'
                      } md:col-span-4`}
                    >
                      <Monitor size={24} className="mx-auto mb-2 text-theme-accent" />
                      <div className="text-sm font-medium text-theme-text-primary">Use System Theme</div>
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500">
              <AlertTriangle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center text-green-500">
              <Check size={16} className="mr-2" />
              {success}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;