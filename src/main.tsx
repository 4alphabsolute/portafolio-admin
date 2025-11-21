import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import MainRoutes from "./Routes";

import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <MainRoutes />
    </HelmetProvider>
  </React.StrictMode>
);