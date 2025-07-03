import { DCAService } from './dcaService';
import { DCASchedule } from '../types/dca';

class DCAExecutor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.checkAndExecuteSchedules();
    }, 60000); // Check every minute
    
    console.log('DCA Executor started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('DCA Executor stopped');
  }

  private async checkAndExecuteSchedules() {
    try {
      const schedulesToExecute = await DCAService.getSchedulesToExecute();
      
      for (const schedule of schedulesToExecute) {
        await this.executeSchedule(schedule);
      }
    } catch (error) {
      console.error('Error checking schedules:', error);
    }
  }

  private async executeSchedule(schedule: DCASchedule) {
    try {
      console.log(`Executing DCA schedule ${schedule.id} for user ${schedule.userId}`);
      
      // Get user preferences
      const preferences = await DCAService.getPreferences(schedule.userId);
      
      // Check if amount exceeds max transaction amount
      if (preferences && schedule.amount > preferences.maxTransactionAmount) {
        console.warn(`Schedule ${schedule.id} amount exceeds max transaction amount`);
        return;
      }
      
      // Execute the purchase
      const transaction = await DCAService.executeDCAPurchase(schedule);
      
      console.log(`DCA purchase completed: ${transaction.id}`);
      
      // In a real app, you would send notifications here
      if (preferences?.notifications.onPurchase) {
        this.sendNotification(schedule.userId, 'DCA Purchase Completed', 
          `Successfully purchased ${transaction.ethAmount.toFixed(6)} ETH for $${transaction.amount}`);
      }
      
    } catch (error) {
      console.error(`Error executing schedule ${schedule.id}:`, error);
      
      // Handle failed transactions
      const preferences = await DCAService.getPreferences(schedule.userId);
      if (preferences?.notifications.onFailure) {
        this.sendNotification(schedule.userId, 'DCA Purchase Failed', 
          `Failed to purchase ETH for $${schedule.amount}. Please check your settings.`);
      }
      
      // Auto-restart on failure if enabled
      if (preferences?.autoRestartOnFailure) {
        console.log(`Auto-restarting failed schedule ${schedule.id}`);
        // In a real implementation, you might want to retry with different parameters
      }
    }
  }

  private sendNotification(userId: string, title: string, message: string) {
    // In a real app, this would integrate with a notification service
    // For now, we'll just log it
    console.log(`Notification for user ${userId}: ${title} - ${message}`);
    
    // You could integrate with:
    // - Email service (SendGrid, Mailgun)
    // - Push notifications (Firebase, OneSignal)
    // - WebSocket for real-time notifications
    // - Discord/Slack webhooks
  }

  // Manual execution for testing
  async executeScheduleNow(scheduleId: string) {
    try {
      const schedules = await DCAService.getSchedules(''); // Get all schedules
      const schedule = schedules.find(s => s.id === scheduleId);
      
      if (schedule) {
        await this.executeSchedule(schedule);
      } else {
        throw new Error('Schedule not found');
      }
    } catch (error) {
      console.error('Error in manual execution:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const dcaExecutor = new DCAExecutor();

// Auto-start the executor when the module is loaded
if (typeof window !== 'undefined') {
  // Only start in browser environment
  dcaExecutor.start();
} 