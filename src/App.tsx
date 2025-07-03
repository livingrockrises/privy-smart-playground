import { useEffect, useState } from "react";
import { usePrivy, useWallets, useSign7702Authorization } from "@privy-io/react-auth";
import { createPublicClient, http, formatEther, parseEther, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Helper function to convert authorizations to the correct format
const getAuthorizationListFromDirectAuths = (
  authorizations: unknown[]
): unknown[] | undefined => {
  const authList = authorizations
    .map((auth) => {
      if (!auth) return null

      const address =
        "address" in (auth as Record<string, unknown>) && (auth as Record<string, unknown>).address
          ? (auth as Record<string, unknown>).address
          : (auth as Record<string, unknown>).contractAddress

      if (!address) return null

      return {
        address,
        chainId: (auth as Record<string, unknown>).chainId,
        nonce: (auth as Record<string, unknown>).nonce,
        r: (auth as Record<string, unknown>).r,
        s: (auth as Record<string, unknown>).s,
        v: (auth as Record<string, unknown>).v,
        yParity: (auth as Record<string, unknown>).yParity
      }
    })
    .filter(Boolean) as unknown[]

  return authList.length ? authList : undefined
}

export default function App() {
  const { login, logout, ready, authenticated, user, sendTransaction } = usePrivy();
  const { wallets } = useWallets();
  const { signAuthorization } = useSign7702Authorization();
  const [ethBalance, setEthBalance] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [isUpgradePending, setIsUpgradePending] = useState(false);
  const [upgradeTransactionHash, setUpgradeTransactionHash] = useState<string>("");

  // Implementation address for smart wallet upgrade
  const implementationAddress = "0x000000004F43C49e93C970E84001853a70923B03";

  // Private key for the signer (from environment variable)
  const privateKey = import.meta.env.VITE_PRIVATE_KEY as `0x${string}` || "<private-key>";

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
                  chain: sepolia,
                  transport: http("https://eth-sepolia.g.alchemy.com/v2/demo"),
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
                chain: sepolia,
                transport: http("https://eth-sepolia.g.alchemy.com/v2/demo"),
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

  const handleSendTransaction = async () => {
    if (!walletAddress) {
      console.error("No wallet address available");
      return;
    }

    try {
      setIsTransactionPending(true);
      setTransactionHash("");

      console.log("Sending transaction to self:", walletAddress);

      // Send 0.001 ETH to self using Privy's sendTransaction
      const result = await sendTransaction({
        to: walletAddress as `0x${string}`,
        value: parseEther("0.001"),
        chainId: sepolia.id,
      });

      console.log("Transaction sent:", result);
      setTransactionHash(result.hash);

      // Wait a bit and refresh balance
      setTimeout(async () => {
        try {
          const client = createPublicClient({
            chain: sepolia,
            transport: http("https://eth-sepolia.g.alchemy.com/v2/demo"),
          });

          const balance = await client.getBalance({ address: walletAddress as `0x${string}` });
          const formattedBalance = formatEther(balance);
          setEthBalance(formattedBalance);
          console.log("Updated balance:", formattedBalance, "ETH");
        } catch (error) {
          console.error("Error updating balance:", error);
        }
      }, 5000);

    } catch (error) {
      console.error("Error sending transaction:", error);
    } finally {
      setIsTransactionPending(false);
    }
  };

  const upgradeToSmartWallet = async () => {
    if (!walletAddress) {
      console.error("No wallet address available");
      return;
    }

    try {
      setIsUpgradePending(true);
      setUpgradeTransactionHash("");

      // Find the embedded wallet
      const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy');
      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      console.log("Upgrading EOA to smart wallet:", walletAddress);
      console.log("Implementation address:", implementationAddress);

      // Create public client for getting nonce
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://sepolia.drpc.org"), // Using DRPC public Sepolia RPC
      });

      try {
        // Get current nonce
        const nonce = await publicClient.getTransactionCount({ 
          address: walletAddress as `0x${string}` 
        });
        console.log("Current nonce:", nonce);

        // Sign the EIP-7702 authorization using Privy's official method
        const authorization = await signAuthorization({
          contractAddress: implementationAddress as `0x${string}`,
          chainId: sepolia.id,
          nonce: nonce,
        });

        console.log("Authorization signed:", authorization);

        // Create authorization list
        const multipleAuths = [authorization];
        const authList = getAuthorizationListFromDirectAuths(multipleAuths);
        console.log("Authorization list:", authList);

        if (!authList) {
          throw new Error("Failed to create authorization list");
        }

        // Submit the EIP-7702 type-4 transaction
        console.log("Submitting EIP-7702 type-4 transaction...");
        
        // Create signer from private key
        const signer = privateKeyToAccount(privateKey);
        console.log("Signer address:", signer.address);
        
        // Create wallet client with the signer
        const walletClient = createWalletClient({
          account: signer,
          chain: sepolia,
          transport: http("https://sepolia.drpc.org")
        });

        try {
          // Submit the EIP-7702 transaction using the signer
          const txParams = {
            // account: signer.address,
            type: 'eip7702',
            chainId: sepolia.id,
            nonce: await publicClient.getTransactionCount({ address: signer.address as `0x${string}` }),
            to: '0x2cf491602ad22944D9047282aBC00D3e52F56B37',
            value: BigInt(0),
            data: '0x',
            authorizationList: authList,
            // kzg: undefined,
          };

          const txHash = await walletClient.sendTransaction(txParams as unknown as Parameters<typeof walletClient.sendTransaction>[0]);

          console.log("EIP-7702 transaction hash:", txHash);
          setUpgradeTransactionHash(txHash);
          
        } catch (sendError) {
          console.error("Error sending EIP-7702 transaction:", sendError);
          
          // If the transaction fails, show the authorization details
          console.log("Authorization was signed successfully:");
          console.log("Authorization:", authorization);
          console.log("Authorization list:", authList);
          console.log("Nonce:", nonce);
          console.log("Signer address:", signer.address);
          
          setUpgradeTransactionHash("Authorization signed - EIP-7702 transaction failed (check console for details)");
        }

      } catch (txError) {
        console.error("Error with EIP-7702 transaction:", txError);
        
        // If the transaction fails, show the authorization details
        console.log("Authorization was signed but transaction failed. This might be due to:");
        console.log("1. EIP-7702 not yet supported on this network");
        console.log("2. Missing bundler integration");
        console.log("3. Network-specific requirements");
        
        setUpgradeTransactionHash("Authorization signed - EIP-7702 transaction failed (check console for details)");
      }

    } catch (error) {
      console.error("Error upgrading to smart wallet:", error);
    } finally {
      setIsUpgradePending(false);
    }
  };

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
              <h1 className="text-xl font-bold text-gray-900">🌟 Privy App (Sepolia)</h1>
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
            You're successfully authenticated with Privy on Sepolia testnet
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

            {walletAddress && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Test Transaction</label>
                <div className="space-y-3">
                  <button
                    onClick={handleSendTransaction}
                    disabled={isTransactionPending}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTransactionPending ? "Sending..." : "Send 0.001 ETH to Self"}
                  </button>
                  
                  <button
                    onClick={upgradeToSmartWallet}
                    disabled={isUpgradePending}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ml-3"
                  >
                    {isUpgradePending ? "Upgrading..." : "Upgrade to Smart Wallet (EIP-7702)"}
                  </button>
                </div>
                
                {transactionHash && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {transactionHash}
                      </a>
                    </p>
                  </div>
                )}

                {upgradeTransactionHash && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Smart Wallet Upgrade Transaction Hash</label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {upgradeTransactionHash}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <p className="text-gray-600 mb-4">
            This is a basic Privy integration on Sepolia testnet. You can now:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Use the embedded wallet for transactions on Sepolia</li>
            <li>Test transactions without real ETH costs</li>
            <li>Add more authentication methods</li>
            <li>Implement smart contract interactions</li>
            <li>Add user profile management</li>
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
              Basic authentication demo with embedded wallet on Sepolia testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
