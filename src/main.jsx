import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LoginProvider } from "./context/LoginContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LoginProvider>
        <App />
      </LoginProvider>
    </AuthProvider>
  </StrictMode>
);
