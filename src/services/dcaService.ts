import { DCASchedule, DCATransaction, DCAPreferences, ETHPrice, DCASummary } from '../types/dca';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Simulated storage (in a real app, this would be a database)
const schedules: DCASchedule[] = [];
const transactions: DCATransaction[] = [];
const preferences: DCAPreferences[] = [];

export class DCAService {
  private static client = createPublicClient({
    chain: mainnet,
    transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
  });

  // ETH Price fetching
  static async getETHPrice(): Promise<ETHPrice> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true');
      const data = await response.json();
      return {
        usd: data.ethereum.usd,
        usd_24h_change: data.ethereum.usd_24h_change,
        last_updated_at: data.ethereum.last_updated_at
      };
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      throw new Error('Failed to fetch ETH price');
    }
  }

  // Schedule Management
  static async createSchedule(schedule: Omit<DCASchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<DCASchedule> {
    const newSchedule: DCASchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    schedules.push(newSchedule);
    return newSchedule;
  }

  static async getSchedules(userId: string): Promise<DCASchedule[]> {
    return schedules.filter(s => s.userId === userId);
  }

  static async updateSchedule(id: string, updates: Partial<DCASchedule>): Promise<DCASchedule | null> {
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    schedules[index] = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return schedules[index];
  }

  static async deleteSchedule(id: string): Promise<boolean> {
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    schedules.splice(index, 1);
    return true;
  }

  // Transaction Management
  static async createTransaction(transaction: Omit<DCATransaction, 'id' | 'createdAt'>): Promise<DCATransaction> {
    const newTransaction: DCATransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    transactions.push(newTransaction);
    return newTransaction;
  }

  static async getTransactions(scheduleId: string): Promise<DCATransaction[]> {
    return transactions.filter(t => t.scheduleId === scheduleId);
  }

  static async getUserTransactions(userId: string): Promise<DCATransaction[]> {
    const userSchedules = schedules.filter(s => s.userId === userId);
    const scheduleIds = userSchedules.map(s => s.id);
    return transactions.filter(t => scheduleIds.includes(t.scheduleId));
  }

  // DCA Execution
  static async executeDCAPurchase(schedule: DCASchedule): Promise<DCATransaction> {
    try {
      // Get current ETH price
      const ethPrice = await this.getETHPrice();
      const ethAmount = schedule.amount / ethPrice.usd;
      
      // Create pending transaction
      const transaction = await this.createTransaction({
        scheduleId: schedule.id,
        amount: schedule.amount,
        ethAmount,
        ethPrice: ethPrice.usd,
        status: 'pending',
        executedAt: new Date(),
      });

      // Simulate transaction execution (in real app, this would be an actual blockchain transaction)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Update transaction as completed
      const completedTransaction = await this.updateTransaction(transaction.id, {
        status: 'completed',
        transactionHash: `0x${crypto.randomUUID().replace(/-/g, '')}`,
      });

      // Update schedule next execution
      const nextExecution = this.calculateNextExecution(schedule.frequency, schedule.nextExecution);
      await this.updateSchedule(schedule.id, { nextExecution });

      return completedTransaction!;
    } catch (error) {
      console.error('Error executing DCA purchase:', error);
      throw new Error('Failed to execute DCA purchase');
    }
  }

  private static async updateTransaction(id: string, updates: Partial<DCATransaction>): Promise<DCATransaction | null> {
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    transactions[index] = {
      ...transactions[index],
      ...updates,
    };
    
    return transactions[index];
  }

  private static calculateNextExecution(frequency: string, currentDate: Date): Date {
    const next = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    
    return next;
  }

  // Preferences Management
  static async getPreferences(userId: string): Promise<DCAPreferences | null> {
    return preferences.find(p => p.userId === userId) || null;
  }

  static async updatePreferences(userId: string, updates: Partial<DCAPreferences>): Promise<DCAPreferences> {
    const index = preferences.findIndex(p => p.userId === userId);
    
    if (index === -1) {
      const newPreferences: DCAPreferences = {
        userId,
        slippageTolerance: 1,
        gasLimit: 21000,
        maxTransactionAmount: 1000,
        autoRestartOnFailure: true,
        notifications: {
          onPurchase: true,
          onFailure: true,
          onScheduleUpdate: true,
        },
        ...updates,
      };
      preferences.push(newPreferences);
      return newPreferences;
    } else {
      preferences[index] = {
        ...preferences[index],
        ...updates,
      };
      return preferences[index];
    }
  }

  // Analytics
  static async getDCASummary(userId: string): Promise<DCASummary> {
    const userTransactions = await this.getUserTransactions(userId);
    const completedTransactions = userTransactions.filter(t => t.status === 'completed');
    
    const totalInvested = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalETH = completedTransactions.reduce((sum, t) => sum + t.ethAmount, 0);
    const averagePrice = totalInvested / totalETH;
    
    // Get current ETH price for calculations
    const currentPrice = await this.getETHPrice();
    const currentValue = totalETH * currentPrice.usd;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = (profitLoss / totalInvested) * 100;
    
    return {
      totalInvested,
      totalETH,
      averagePrice,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  }

  // Check for schedules that need execution
  static async getSchedulesToExecute(): Promise<DCASchedule[]> {
    const now = new Date();
    return schedules.filter(s => 
      s.isActive && 
      s.nextExecution <= now
    );
  }
} 