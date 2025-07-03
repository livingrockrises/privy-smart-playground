# 🌟 Privy App - Basic Authentication Demo

A simple web application demonstrating basic Privy authentication integration with React and TypeScript.

## 🚀 Features

### Core Authentication
- **Privy Integration**: Seamless authentication with email or wallet
- **Embedded Wallets**: Built-in wallet functionality for easy ETH management
- **User Information Display**: Show user ID, email, and wallet address
- **ETH Balance**: Display current wallet balance

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Simple Navigation**: Easy-to-use interface
- **Real-time Updates**: Live balance updates and authentication status

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Privy
- **Blockchain**: Viem for Ethereum interactions
- **APIs**: Alchemy for ETH balance data

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

### 2. View User Information
- See your user ID and authentication status
- View your wallet address (if using wallet authentication)
- Check your current ETH balance

### 3. Explore Features
- The app shows basic user information
- ETH balance is displayed in the header
- Clean, simple interface for easy understanding

## 🔧 Architecture

### Components
- `App.tsx`: Main application with authentication and user display
- `main.tsx`: Application entry point with Privy provider

### Features
- **Authentication Flow**: Complete login/logout functionality
- **Wallet Integration**: Embedded wallet with balance display
- **Responsive Design**: Mobile-friendly interface

## 🚀 Production Considerations

### Environment Variables
Set up proper environment variables for production:
```bash
VITE_PRIVY_APP_ID=your-privy-app-id
VITE_ALCHEMY_API_KEY=your-alchemy-key
```

### Customization
This basic setup can be extended with:
- Additional authentication methods
- User profile management
- Smart contract interactions
- Transaction functionality
- Custom styling and branding

## 📊 API Integration

The application integrates with:
- **Privy API**: For authentication and wallet management
- **Alchemy API**: For Ethereum blockchain data
- **Viem**: For blockchain interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
- Open an issue on GitHub
- Check the [Privy Documentation](https://docs.privy.io/)
- Review the code comments for implementation details

## 🌟 What's Next?

This basic setup provides a solid foundation for building more complex applications. You can extend it with:

- **Advanced Authentication**: Add social logins, phone verification
- **Wallet Features**: Implement transactions, token transfers
- **Smart Contracts**: Integrate with DeFi protocols
- **User Management**: Add profiles, settings, preferences
- **Real-time Features**: WebSocket connections, live updates
