import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { UndoProvider } from "./contexts/UndoContext";

export default function App() {
  return (
    <AuthProvider>
      <UndoProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </UndoProvider>
    </AuthProvider>
  );
}
