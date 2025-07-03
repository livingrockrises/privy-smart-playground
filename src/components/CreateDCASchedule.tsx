import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { DCAService } from '../services/dcaService';
import { ETHPrice } from '../types/dca';

interface CreateDCAScheduleProps {
  onScheduleCreated: () => void;
  onCancel: () => void;
}

export default function CreateDCASchedule({ onScheduleCreated, onCancel }: CreateDCAScheduleProps) {
  const { user } = usePrivy();
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [ethPrice, setEthPrice] = useState<ETHPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadETHPrice();
  }, []);

  const loadETHPrice = async () => {
    try {
      const price = await DCAService.getETHPrice();
      setEthPrice(price);
    } catch (error) {
      console.error('Error loading ETH price:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.push('Please enter a valid amount');
    }
    
    if (parseFloat(amount) > 10000) {
      newErrors.push('Maximum amount is $10,000 per transaction');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id || !user?.wallet?.address) {
      return;
    }

    setLoading(true);
    
    try {
      const nextExecution = new Date();
      nextExecution.setHours(nextExecution.getHours() + 1); // Start in 1 hour
      
      await DCAService.createSchedule({
        userId: user.id,
        walletAddress: user.wallet.address,
        amount: parseFloat(amount),
        frequency,
        nextExecution,
        isActive: true,
      });
      
      onScheduleCreated();
    } catch (error) {
      console.error('Error creating schedule:', error);
      setErrors(['Failed to create schedule. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const estimatedETH = ethPrice && amount ? (parseFloat(amount) / ethPrice.usd).toFixed(6) : '0';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Create DCA Schedule</h2>
      
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="1"
            max="10000"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {ethPrice && amount && (
            <p className="text-sm text-gray-500 mt-1">
              ≈ {estimatedETH} ETH (${ethPrice.usd}/ETH)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Schedule Summary</h3>
          <p className="text-sm text-blue-700">
            You'll invest <strong>${amount || '0'}</strong> every{' '}
            <strong>{frequency}</strong> starting in 1 hour.
          </p>
          {frequency === 'daily' && (
            <p className="text-xs text-blue-600 mt-1">
              Monthly total: ${amount ? (parseFloat(amount) * 30).toFixed(2) : '0'}
            </p>
          )}
          {frequency === 'weekly' && (
            <p className="text-xs text-blue-600 mt-1">
              Monthly total: ${amount ? (parseFloat(amount) * 4.33).toFixed(2) : '0'}
            </p>
          )}
          {frequency === 'monthly' && (
            <p className="text-xs text-blue-600 mt-1">
              Monthly total: ${amount || '0'}
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
} 