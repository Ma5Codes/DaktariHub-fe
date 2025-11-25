import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { LoginProvider } from "./context/LoginContext";

createRoot(document.getElementById("root")).render(
  <LoginProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </LoginProvider>
);
