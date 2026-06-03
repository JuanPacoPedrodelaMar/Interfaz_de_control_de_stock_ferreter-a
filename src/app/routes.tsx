import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Movements } from "./pages/Movements";
import { Restock } from "./pages/Restock";
import { Offers } from "./pages/Offers";
import { Warehouse } from "./pages/Warehouse";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "inventory", element: <Inventory /> },
      { path: "movements", element: <Movements /> },
      { path: "restock", element: <Restock /> },
      { path: "offers", element: <Offers /> },
      { path: "warehouse", element: <Warehouse /> },
    ],
  },
]);
