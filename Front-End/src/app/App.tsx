import { RouterProvider } from "react-router-dom"; // ✅ mieux que "react-router"
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { BusinessProvider } from "@/shared/contexts/BusinessContext";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import ThemeToggle from "@/shared/components/ThemeToggle";
import { router } from "@/app/routes";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BusinessProvider>
          <ThemeToggle />
          <RouterProvider router={router} />
          <Toaster />
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
