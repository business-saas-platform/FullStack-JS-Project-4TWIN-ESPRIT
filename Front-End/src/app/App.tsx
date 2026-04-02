import { RouterProvider } from "react-router-dom"; // ✅ mieux que "react-router"
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { BusinessProvider } from "@/shared/contexts/BusinessContext";
import { router } from "@/app/routes";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <RouterProvider router={router} />
        <Toaster />
      </BusinessProvider>
    </AuthProvider>
  );
}
