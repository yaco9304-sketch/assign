import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import MyPreferencePage from "./pages/MyPreferencePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSummary from "./pages/AdminSummary";
import AdminSettings from "./pages/AdminSettings";
import AdminAssignments from "./pages/AdminAssignments";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import "./index.css";

const qc = new QueryClient();

// PWA Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// GitHub Pages base path 설정
const basename = import.meta.env.BASE_URL || '/assign/';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-preference" element={<MyPreferencePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/summary" element={<AdminSummary />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <PWAInstallPrompt />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
