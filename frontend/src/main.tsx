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
import "./index.css";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-preference" element={<MyPreferencePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/summary" element={<AdminSummary />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
