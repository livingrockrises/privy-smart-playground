export interface DCASchedule {
  id: string;
  userId: string;
  walletAddress: string;
  amount: number; // Amount in USD
  frequency: 'daily' | 'weekly' | 'monthly';
  nextExecution: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DCATransaction {
  id: string;
  scheduleId: string;
  amount: number; // Amount in USD
  ethAmount: number; // Amount of ETH purchased
  ethPrice: number; // Price of ETH at time of purchase
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  executedAt: Date;
  createdAt: Date;
}

export interface DCAPreferences {
  userId: string;
  slippageTolerance: number; // Percentage (0-100)
  gasLimit: number;
  maxTransactionAmount: number; // Maximum USD per transaction
  autoRestartOnFailure: boolean;
  notifications: {
    onPurchase: boolean;
    onFailure: boolean;
    onScheduleUpdate: boolean;
  };
}

export interface ETHPrice {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
}

export interface DCASummary {
  totalInvested: number;
  totalETH: number;
  averagePrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
} 