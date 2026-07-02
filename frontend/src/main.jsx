import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";
import "./styles/base.css";
import "./styles/login.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/dashboard.css";
import "./styles/detail.css";
import "./styles/modals.css";
import "./styles/internal.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
