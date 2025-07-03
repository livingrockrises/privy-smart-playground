import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { DCAService } from '../services/dcaService';
import { DCAPreferences } from '../types/dca';

export default function DCAPreferencesComponent() {
  const { user } = usePrivy();
  const [preferences, setPreferences] = useState<DCAPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await DCAService.getPreferences(user!.id);
      if (prefs) {
        setPreferences(prefs);
      } else {
        // Create default preferences
        const defaultPrefs = await DCAService.updatePreferences(user!.id, {});
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !preferences) return;

    setSaving(true);
    setMessage('');

    try {
      await DCAService.updatePreferences(user.id, preferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof DCAPreferences['notifications'], value: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!preferences) {
    return <div className="text-center text-gray-500">Failed to load preferences</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">DCA Preferences</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Trading Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trading Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                value={preferences.slippageTolerance}
                onChange={(e) => setPreferences({
                  ...preferences,
                  slippageTolerance: parseFloat(e.target.value) || 1
                })}
                min="0.1"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher slippage increases success rate but may result in worse prices
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gas Limit
              </label>
              <input
                type="number"
                value={preferences.gasLimit}
                onChange={(e) => setPreferences({
                  ...preferences,
                  gasLimit: parseInt(e.target.value) || 21000
                })}
                min="21000"
                max="500000"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher gas limit for complex transactions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Transaction Amount (USD)
              </label>
              <input
                type="number"
                value={preferences.maxTransactionAmount}
                onChange={(e) => setPreferences({
                  ...preferences,
                  maxTransactionAmount: parseFloat(e.target.value) || 1000
                })}
                min="10"
                max="50000"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum amount per DCA transaction
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRestart"
                checked={preferences.autoRestartOnFailure}
                onChange={(e) => setPreferences({
                  ...preferences,
                  autoRestartOnFailure: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRestart" className="ml-2 block text-sm text-gray-900">
                Auto-restart failed transactions
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyPurchase"
                checked={preferences.notifications.onPurchase}
                onChange={(e) => updateNotification('onPurchase', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifyPurchase" className="ml-2 block text-sm text-gray-900">
                Notify on successful purchases
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyFailure"
                checked={preferences.notifications.onFailure}
                onChange={(e) => updateNotification('onFailure', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifyFailure" className="ml-2 block text-sm text-gray-900">
                Notify on failed transactions
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyScheduleUpdate"
                checked={preferences.notifications.onScheduleUpdate}
                onChange={(e) => updateNotification('onScheduleUpdate', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notifyScheduleUpdate" className="ml-2 block text-sm text-gray-900">
                Notify on schedule changes
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
} 