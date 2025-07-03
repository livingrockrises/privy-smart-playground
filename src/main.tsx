import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = "your-privy-app-id-here";

ReactDOM.createRoot(document.getElementById("root")!).render(
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
    }}
  >
    <App />
  </PrivyProvider>
);
