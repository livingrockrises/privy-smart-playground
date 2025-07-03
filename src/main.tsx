import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia } from "viem/chains";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "<privy-app-id>";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider 
    appId={PRIVY_APP_ID}
    config={{
      loginMethods: ['email', 'wallet'],
      appearance: {
        theme: 'light',
        accentColor: '#676FFF',
      },
      embeddedWallets: {
        createOnLogin: 'users-without-wallets',
      },
      defaultChain: sepolia,
    }}
  >
    <App />
  </PrivyProvider>
);
