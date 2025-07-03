import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";
import DCADashboard from "./components/DCADashboard";
import CreateDCASchedule from "./components/CreateDCASchedule";
import DCAPreferencesComponent from "./components/DCAPreferences";

type View = 'dashboard' | 'create' | 'preferences';

export default function App() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const [ethBalance, setEthBalance] = useState<string>("");
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.wallet?.address) return;

      const client = createPublicClient({
        chain: mainnet,
        transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
      });

      const balance = await client.getBalance({ address: user.wallet.address as `0x${string}` });
      setEthBalance(formatEther(balance));
    };

    if (authenticated && user?.wallet?.address) {
      fetchBalance();
    }
  }, [authenticated, user?.wallet?.address]);

  if (!ready) return <p>Loading Privy...</p>;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🌟 ETH DCA</h1>
            <p className="text-gray-600 mb-8">Automated Dollar Cost Averaging for Ethereum</p>
            <button 
              onClick={login}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Get Started with Privy
            </button>
          </div>
        </div>
      </div>
    );
  }

  const embeddedWallet = user?.wallet;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DCADashboard />;
      case 'create':
        return (
          <CreateDCASchedule
            onScheduleCreated={() => setCurrentView('dashboard')}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'preferences':
        return <DCAPreferencesComponent />;
      default:
        return <DCADashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🌟 ETH DCA</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {embeddedWallet && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Balance:</span> {ethBalance} ETH
                </div>
              )}
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Schedule
            </button>
            <button
              onClick={() => setCurrentView('preferences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.email?.address || user?.wallet?.address?.slice(0, 8) + '...'}!
          </h2>
          <p className="text-gray-600">
            Manage your automated Ethereum dollar cost averaging strategy
          </p>
        </div>

        {renderView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by Privy • Secure • Automated • Smart</p>
            <p className="mt-1">
              This is a demo application. Always do your own research before investing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
