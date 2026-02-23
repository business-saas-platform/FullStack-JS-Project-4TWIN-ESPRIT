import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  UsersRound,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Button, Avatar, AvatarFallback } from "@/shared/ui";
import { BusinessSwitcher } from "../molecules/BusinessSwitcher";
import { AIAssistant } from "../organisms/AIAssistant";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { useAuth } from "@/shared/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Sparkles },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Team", href: "/dashboard/team", icon: UsersRound },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { currentBusiness, setCurrentBusiness, businesses, isReady } = useBusinessContext();
  const { user, logout, isReady: authReady } = useAuth();

  const isOnSetupPage = location.pathname.startsWith("/dashboard/company/setup");

  // ✅ Brand title: show company name if exists, otherwise fallback
  const brandTitle = useMemo(() => {
    return (currentBusiness as any)?.name || "BizManager";
  }, [currentBusiness]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  const handleBusinessChange = (business: (typeof businesses)[0]) => {
    setCurrentBusiness(business);
    // make sure business id persists (BusinessContext already does it, but safe)
    if ((business as any)?.id) {
      localStorage.setItem("current_business_id", String((business as any).id));
      window.dispatchEvent(new Event("business-changed"));
    }
  };

  // ✅ close the user menu when route changes
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ✅ HARD FIX: redirect to setup ONLY when needed (no loop)
  useEffect(() => {
    // wait until auth + business context are ready
    if (!authReady || !isReady) return;

    // only owners must complete company profile (adjust if needed)
    const isOwner = user?.role === "business_owner";

    // If no current business selected, but there are businesses => select first
    if (!currentBusiness && businesses.length > 0) {
      handleBusinessChange(businesses[0]);
      return;
    }

    // If profile incomplete -> force setup (but don't loop)
    const incomplete = (currentBusiness as any)?.isProfileComplete === false;

    if (isOwner && incomplete && !isOnSetupPage) {
      navigate("/dashboard/company/setup", { replace: true });
      return;
    }

    // If profile complete and you are on setup page -> go dashboard
    if (isOwner && !incomplete && isOnSetupPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [
    authReady,
    isReady,
    user?.role,
    currentBusiness,
    businesses,
    isOnSetupPage,
    navigate,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              {/* ✅ Company name instead of Operia */}
              <span className="text-xl font-bold truncate">{brandTitle}</span>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="px-4 py-4">
              <BusinessSwitcher
                businesses={businesses}
                currentBusiness={currentBusiness}
                onBusinessChange={handleBusinessChange}
              />
            </div>

            <nav className="flex-1 space-y-1 px-2 py-2">
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  location.pathname.startsWith(item.href + "/");
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4 border-b">
            {/* ✅ Company name instead of Operia */}
            <span className="text-xl font-bold truncate">{brandTitle}</span>
          </div>

          <div className="px-4 py-4">
            <BusinessSwitcher
              businesses={businesses}
              currentBusiness={currentBusiness}
              onBusinessChange={handleBusinessChange}
            />
          </div>

          <nav className="flex-1 space-y-1 px-2 py-2">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(item.href + "/");
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white">
          <Button
            variant="ghost"
            className="px-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 justify-between px-4 lg:px-8">
            <div className="flex flex-1 items-center">{/* Search */}</div>

            {/* User menu */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user?.name)}</AvatarFallback>
                </Avatar>

                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name ?? "User"}
                  </span>
                  <span className="text-xs text-gray-500">{user?.email ?? ""}</span>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setUserMenuOpen(false)}
                    aria-label="Close menu"
                  />

                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">
                        {user?.name ?? "User"}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email ?? ""}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/dashboard/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>

                    <div className="h-px bg-gray-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}