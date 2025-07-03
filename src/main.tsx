import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = "cmcnu3e8z02bhin0mfm0g3muy";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivyProvider appId={PRIVY_APP_ID}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
