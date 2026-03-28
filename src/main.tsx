import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

// Remove dark mode class addition
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
