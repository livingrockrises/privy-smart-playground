import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";

export default function App() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [ethBalance, setEthBalance] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      console.log("User authenticated:", user);
      console.log("Wallets from useWallets hook:", wallets);
      console.log("Wallets length:", wallets?.length);
      
      // Add a small delay to wait for wallets to be ready
      const timer = setTimeout(() => {
        console.log("After delay - Wallets:", wallets);
        
        // Get the embedded wallet
        const getWallet = async () => {
          try {
            // Check if we have wallets from the useWallets hook
            if (wallets && wallets.length > 0) {
              console.log("All wallets:", wallets);
              const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
              console.log("Embedded wallet found:", embeddedWallet);
              
              if (embeddedWallet) {
                const address = embeddedWallet.address;
                setWalletAddress(address);
                console.log("Embedded wallet address:", address);
                
                // Get wallet balance
                const client = createPublicClient({
                  chain: mainnet,
                  transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
                });

                const balance = await client.getBalance({ address: address as `0x${string}` });
                const formattedBalance = formatEther(balance);
                setEthBalance(formattedBalance);
                console.log("Wallet balance:", formattedBalance, "ETH");
              } else {
                console.log("No embedded wallet found in wallets array");
                console.log("Available wallet types:", wallets.map(w => w.walletClientType));
              }
            } else if (user.wallet?.address) {
              // Fallback to user.wallet if available
              const address = user.wallet.address;
              setWalletAddress(address);
              console.log("Wallet address from user.wallet:", address);
              
              // Get wallet balance
              const client = createPublicClient({
                chain: mainnet,
                transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
              });

              const balance = await client.getBalance({ address: address as `0x${string}` });
              const formattedBalance = formatEther(balance);
              setEthBalance(formattedBalance);
              console.log("Wallet balance:", formattedBalance, "ETH");
            } else {
              console.log("No wallet address found in user object or useWallets hook");
              console.log("User object:", user);
              console.log("Wallets array:", wallets);
            }
          } catch (error) {
            console.error("Error getting wallet:", error);
          }
        };

        getWallet();
      }, 1000); // Wait 1 second for wallets to be ready

      return () => clearTimeout(timer);
    }
  }, [user?.id, wallets]);

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
              {ethBalance && (
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

            {walletAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Embedded Wallet Address</label>
                <p className="text-sm text-gray-900 font-mono break-all">{walletAddress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This wallet was automatically created for your email account
                </p>
              </div>
            )}

            {user?.wallet?.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Connected Wallet Address</label>
                <p className="text-sm text-gray-900 font-mono break-all">{user.wallet.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  This is your connected external wallet
                </p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Wallet Information</h3>
          
          <div className="space-y-4">
            {walletAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Embedded Wallet</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-900 font-mono break-all">{walletAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This embedded wallet is automatically created and managed by Privy
                  </p>
                </div>
              </div>
            )}

            {ethBalance && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                <p className="text-2xl font-bold text-gray-900">{ethBalance} ETH</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <p className="text-gray-600 mb-4">
            This is a basic Privy integration. You can now:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Use the embedded wallet for transactions</li>
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
              Basic authentication demo with embedded wallet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
