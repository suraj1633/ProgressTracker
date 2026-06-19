import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./styles/globals.css";
import "./styles/theme.css";

import { ProgressProvider } from "./context/ProgressContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </AuthProvider>
  </React.StrictMode>
);
