import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Movements } from "./pages/Movements";
import { Restock } from "./pages/Restock";
import { Layout } from "./components/Layout";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "inventory", element: <Inventory /> },
      { path: "movements", element: <Movements /> },
      { path: "restock", element: <Restock /> },
    ],
  },
]);
