# 🌟 ETH DCA - Automated Dollar Cost Averaging for Ethereum

A modern web application that enables users to set up automated Dollar Cost Averaging (DCA) strategies for Ethereum using Privy for seamless authentication and wallet management.

## 🚀 Features

### Core DCA Functionality
- **Automated Purchases**: Set up recurring ETH purchases on daily, weekly, or monthly schedules
- **Smart Execution**: Background service automatically executes purchases when schedules are due
- **Real-time ETH Pricing**: Live price feeds from CoinGecko API
- **Transaction Tracking**: Complete history of all DCA transactions with status tracking

### User Management
- **Privy Integration**: Seamless authentication with email or wallet
- **Embedded Wallets**: Built-in wallet functionality for easy ETH management
- **User Preferences**: Customizable settings for slippage tolerance, gas limits, and notifications

### Analytics & Monitoring
- **Portfolio Dashboard**: Real-time overview of total invested, ETH holdings, and P&L
- **Performance Tracking**: Track average purchase price and current portfolio value
- **Transaction History**: Detailed view of all past DCA transactions

### Advanced Features
- **Customizable Preferences**: Set maximum transaction amounts, slippage tolerance, and gas limits
- **Notification System**: Get notified of successful purchases, failures, and schedule updates
- **Auto-restart**: Automatically retry failed transactions
- **Security**: Built-in safeguards and transaction limits

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Privy
- **Blockchain**: Viem for Ethereum interactions
- **Data**: In-memory storage (demo) - easily replaceable with database
- **APIs**: CoinGecko for ETH price data

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-privy-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Privy**
   - Get your Privy App ID from [Privy Console](https://console.privy.io/)
   - Update `src/main.tsx` with your Privy App ID:
   ```typescript
   const PRIVY_APP_ID = "your-privy-app-id-here";
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 How to Use

### 1. Authentication
- Click "Get Started with Privy" to authenticate
- Choose between email or wallet-based authentication
- Your embedded wallet will be automatically created

### 2. Create DCA Schedule
- Navigate to "Create Schedule" tab
- Set your investment amount (USD)
- Choose frequency: daily, weekly, or monthly
- Review the schedule summary
- Click "Create Schedule"

### 3. Monitor Your Portfolio
- View your dashboard for real-time portfolio overview
- Track total invested, ETH holdings, and profit/loss
- Monitor active schedules and recent transactions

### 4. Customize Preferences
- Go to "Preferences" tab
- Adjust trading parameters (slippage, gas limits)
- Set notification preferences
- Configure maximum transaction amounts

## 🔧 Architecture

### Components
- `App.tsx`: Main application with navigation and layout
- `DCADashboard.tsx`: Portfolio overview and analytics
- `CreateDCASchedule.tsx`: Schedule creation form
- `DCAPreferences.tsx`: User preferences management

### Services
- `dcaService.ts`: Core DCA business logic and data management
- `dcaExecutor.ts`: Background service for automated execution

### Types
- `dca.ts`: TypeScript interfaces for DCA data structures

## 🔒 Security Features

- **Transaction Limits**: Configurable maximum amounts per transaction
- **Slippage Protection**: Customizable slippage tolerance
- **Gas Management**: Configurable gas limits for transactions
- **Error Handling**: Comprehensive error handling and recovery

## 🚀 Production Considerations

### Database Integration
Replace the in-memory storage with a proper database:
```typescript
// Example with PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Update DCAService methods to use database queries
```

### Real Blockchain Integration
Replace simulated transactions with actual blockchain interactions:
```typescript
// Example with Uniswap V3
import { SwapRouter } from '@uniswap/v3-sdk';

// Implement actual swap logic
const swapTransaction = await swapRouter.exactInputSingle(params);
```

### Notification Services
Integrate with real notification services:
```typescript
// Example with SendGrid
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: userEmail,
  from: 'noreply@yourdca.com',
  subject: 'DCA Purchase Completed',
  text: message,
});
```

### Background Job Processing
Use a proper job queue for DCA execution:
```typescript
// Example with Bull Queue
import Queue from 'bull';

const dcaQueue = new Queue('dca-execution', {
  redis: process.env.REDIS_URL,
});

// Add jobs to queue instead of using setInterval
```

## 📊 API Endpoints (Future)

The application is designed to easily add REST API endpoints:

```typescript
// Example API routes
GET /api/schedules - Get user's DCA schedules
POST /api/schedules - Create new DCA schedule
PUT /api/schedules/:id - Update DCA schedule
DELETE /api/schedules/:id - Delete DCA schedule
GET /api/transactions - Get transaction history
GET /api/analytics - Get portfolio analytics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demo application for educational purposes. Always do your own research before investing in cryptocurrencies. The application includes simulated transactions and should not be used for actual trading without proper security audits and real blockchain integration.

## 🆘 Support

For questions or issues:
- Open an issue on GitHub
- Check the documentation
- Review the code comments for implementation details
