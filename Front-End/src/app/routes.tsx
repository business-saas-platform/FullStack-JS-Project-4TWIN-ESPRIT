import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

// Front-office
import { LandingPage } from "@/front-office/pages/LandingPage";

// Layouts
import { AuthLayout } from "@/back-office/templates/AuthLayout";
import { DashboardLayout } from "@/back-office/templates/DashboardLayout";
import { PlatformAdminLayout } from "@/back-office/templates/PlatformAdminLayout";

// Auth Pages
import { Login } from "@/app/pages/auth/Login";
import { Register } from "@/back-office/pages/auth/Register";
import { ForgotPassword } from "@/back-office/pages/auth/ForgotPassword";
import AcceptInvite from "@/app/pages/auth/AcceptInvite";
import OAuthSuccess from "@/app/pages/auth/OAuthSuccess";
import ForceChangePassword from "@/app/pages/auth/ForceChangePassword";

// OAuth Callback
import OAuthCallback from "@/app/pages/auth/OAuthCallback";

// Dashboard Pages
import { Dashboard } from "@/back-office/pages/dashboard/Dashboard";
import CreateBusiness from "@/back-office/pages/businesses/CreateBusiness";
import { RequireCompanySetup } from "@/shared/components/RequireCompanySetup";
import { Invoices } from "@/app/pages/invoices/Invoices";
import { CreateInvoice } from "@/app/pages/invoices/CreateInvoice";
import { ViewInvoice } from "@/app/pages/invoices/ViewInvoice";
import { Expenses } from "@/app/pages/expenses/Expenses";
import { CreateExpense } from "@/app/pages/expenses/CreateExpense";
import { Clients } from "@/app/pages/clients/Clients";
import { ClientDetails } from "@/app/pages/clients/ClientDetails";
import { Team } from "@/app/pages/team/Team";
import { Reports } from "@/app/pages/reports/Reports";
import { Settings } from "@/app/pages/settings/Settings";

// Platform Admin pages
import { AdminOverview } from "@/app/pages/admin/AdminOverview";
import { BusinessOwners } from "@/app/pages/admin/BusinessOwners";
import { Businesses } from "@/app/pages/admin/Businesses";
import { Analytics } from "@/app/pages/admin/Analytics";

// Admin page (approve/reject requests)
import RegistrationRequestsAdmin from "@/app/pages/admin/RegistrationRequestsAdmin";

// AI
import { AIInsights } from "@/app/pages/ai/AIInsights";

// OPTIONAL company setup page
import CompanySetup from "@/app/pages/businesses/CompanySetup";

export const router = createBrowserRouter([
  // PUBLIC
  { path: "/", Component: LandingPage },

  // OAuth callback (public)
  { path: "/auth/oauth-callback", element: <OAuthCallback /> },

  // OAuth success (public)
  { path: "/oauth-success", Component: OAuthSuccess },

  // AUTH
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "register", Component: Register }, // Owner Request page
      { path: "force-change-password", Component: ForceChangePassword },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "accept-invite", Component: AcceptInvite },
    ],
  },

  // PLATFORM ADMIN
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={["platform_admin"]}>
        <PlatformAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: AdminOverview },
      { path: "businesses", Component: Businesses },
      { path: "owners", Component: BusinessOwners },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "registration-requests", Component: RegistrationRequestsAdmin },
    ],
  },

  // DASHBOARD
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute
        roles={[
          "business_owner",
          "business_admin",
          "accountant",
          "team_member",
          "client",
          "platform_admin",
        ]}
      >
        <RequireCompanySetup>
        <DashboardLayout />
        </RequireCompanySetup>
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },

      // Company profile completion
      { path: "company/setup", Component: CompanySetup },

      { path: "businesses/new", Component: CreateBusiness },
      { path: "ai-insights", Component: AIInsights },
      { path: "invoices", Component: Invoices },
      { path: "invoices/create", Component: CreateInvoice },
      { path: "invoices/:id", Component: ViewInvoice },
      { path: "expenses", Component: Expenses },
      { path: "expenses/create", Component: CreateExpense },
      { path: "clients", Component: Clients },
      { path: "clients/:id", Component: ClientDetails },
      { path: "team", Component: Team },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
