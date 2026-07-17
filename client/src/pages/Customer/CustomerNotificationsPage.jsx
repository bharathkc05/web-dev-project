import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../features/auth/services/auth.service';

export const CustomerNotificationsPage = () => {
  const { user, token, refreshToken } = useAuth();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    notificationSettings: user?.notificationSettings || {
      importantMessageAlerts: true,
      orderTracking: true,
      pushNotifications: true,
      exclusiveOffers: true,
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const updatedProfile = await authService.updateProfile({
        notificationSettings: formData.notificationSettings
      });
      setAuth({ ...user, ...updatedProfile }, token, refreshToken);
      setSuccessMsg('Notification settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = (key) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: !prev.notificationSettings[key]
      }
    }));
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">NOTIFICATIONS</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-[#e6f4ea] border border-[#137333]/20 text-[#137333] rounded-xl text-sm font-bold">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <div 
            onClick={() => toggleSetting('importantMessageAlerts')}
            className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div>
              <p className="font-bold text-on-surface text-base">Important Message Alerts</p>
              <p className="text-xs text-on-surface-variant mt-1">Get updates on your account security and essential notices.</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${formData.notificationSettings.importantMessageAlerts ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <div className={`w-5 h-5 bg-white rounded-full mx-0.5 mt-0.5 shadow-sm transition-transform ${formData.notificationSettings.importantMessageAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleSetting('orderTracking')}
            className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div>
              <p className="font-bold text-on-surface text-base">Order Tracking</p>
              <p className="text-xs text-on-surface-variant mt-1">Receive live updates on your order status and delivery.</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${formData.notificationSettings.orderTracking ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <div className={`w-5 h-5 bg-white rounded-full mx-0.5 mt-0.5 shadow-sm transition-transform ${formData.notificationSettings.orderTracking ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleSetting('pushNotifications')}
            className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div>
              <p className="font-bold text-on-surface text-base">Push Notifications</p>
              <p className="text-xs text-on-surface-variant mt-1">Allow notifications to be pushed to your device.</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${formData.notificationSettings.pushNotifications ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <div className={`w-5 h-5 bg-white rounded-full mx-0.5 mt-0.5 shadow-sm transition-transform ${formData.notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => toggleSetting('exclusiveOffers')}
            className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div>
              <p className="font-bold text-on-surface text-base">Exclusive Offers</p>
              <p className="text-xs text-on-surface-variant mt-1">Happy Hours, Birthday, Limited Time Discounts</p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${formData.notificationSettings.exclusiveOffers ? 'bg-primary' : 'bg-surface-container-high'}`}>
              <div className={`w-5 h-5 bg-white rounded-full mx-0.5 mt-0.5 shadow-sm transition-transform ${formData.notificationSettings.exclusiveOffers ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-3 bg-orange text-white rounded-lg font-black uppercase tracking-wider text-sm hover:bg-orange/90 transition-colors shadow-sm disabled:opacity-70 flex items-center"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
