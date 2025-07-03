import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";

export default function App() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const [ethBalance, setEthBalance] = useState<string>("");

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🌟 Privy App</h1>
            <p className="text-gray-600 mb-8">Basic Privy Authentication Demo</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🌟 Privy App</h1>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.email?.address || user?.wallet?.address?.slice(0, 8) + '...'}!
          </h2>
          <p className="text-gray-600">
            You're successfully authenticated with Privy
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-sm text-gray-900">{user?.id}</p>
            </div>

            {user?.email?.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{user.email.address}</p>
              </div>
            )}

            {embeddedWallet && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                <p className="text-sm text-gray-900 font-mono">{embeddedWallet.address}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Authentication Status</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Authenticated
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <p className="text-gray-600 mb-4">
            This is a basic Privy integration. You can now:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Add more authentication methods</li>
            <li>Implement wallet transactions</li>
            <li>Add user profile management</li>
            <li>Integrate with smart contracts</li>
            <li>Build your own features on top of this foundation</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by Privy • Secure • Simple</p>
            <p className="mt-1">
              Basic authentication demo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
