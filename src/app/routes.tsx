import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Movements } from "./pages/Movements";
import { Restock } from "./pages/Restock";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inventory", Component: Inventory },
      { path: "movements", Component: Movements },
      { path: "restock", Component: Restock },
    ],
  },
]);
