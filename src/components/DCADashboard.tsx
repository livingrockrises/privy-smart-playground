import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { DCAService } from '../services/dcaService';
import { DCASummary, DCASchedule, DCATransaction } from '../types/dca';
import { format } from 'date-fns';

export default function DCADashboard() {
  const { user } = usePrivy();
  const [summary, setSummary] = useState<DCASummary | null>(null);
  const [schedules, setSchedules] = useState<DCASchedule[]>([]);
  const [transactions, setTransactions] = useState<DCATransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, schedulesData, transactionsData] = await Promise.all([
        DCAService.getDCASummary(user!.id),
        DCAService.getSchedules(user!.id),
        DCAService.getUserTransactions(user!.id),
      ]);
      
      setSummary(summaryData);
      setSchedules(schedulesData);
      setTransactions(transactionsData.slice(0, 5)); // Show last 5 transactions
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
            <p className="text-2xl font-bold text-gray-900">${summary.totalInvested.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total ETH</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.totalETH.toFixed(6)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Current Value</h3>
            <p className="text-2xl font-bold text-gray-900">${summary.currentValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">P&L</h3>
            <p className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profitLoss >= 0 ? '+' : ''}${summary.profitLoss.toFixed(2)} ({summary.profitLossPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      )}

      {/* Active Schedules */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Active DCA Schedules</h2>
        </div>
        <div className="p-6">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active DCA schedules</p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">${schedule.amount} {schedule.frequency}</p>
                    <p className="text-sm text-gray-500">
                      Next: {format(schedule.nextExecution, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </span>
                    <button
                      onClick={() => {/* TODO: Edit schedule */}}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">${transaction.amount} → {transaction.ethAmount.toFixed(6)} ETH</p>
                    <p className="text-sm text-gray-500">
                      {format(transaction.executedAt, 'MMM dd, yyyy HH:mm')} @ ${transaction.ethPrice}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                    {transaction.transactionHash && (
                      <a
                        href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 