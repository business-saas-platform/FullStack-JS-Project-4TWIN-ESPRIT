import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  Shield,
  ClipboardList,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  Badge,
} from "@/shared/ui";

// Optional (if you want pending count later):
// import { RegistrationRequestsApi } from "@/shared/lib/services/registrationRequests";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
};

export function PlatformAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Active matching for sub routes
  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  // ✅ Navigation (left sidebar)
  const navigation: NavItem[] = useMemo(
    () => [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "Businesses", href: "/admin/businesses", icon: Building2 },
      { name: "Business Owners", href: "/admin/owners", icon: Users },

      // ✅ NEW: Registration Requests
      {
        name: "Registration Requests",
        href: "/admin/registration-requests",
        icon: ClipboardList,
        // badge: pendingCount, // you can enable later
      },

      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
    []
  );

  const handleLogout = () => {
    // clean auth locally
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("current_business_id");

    // notify contexts
    window.dispatchEvent(new Event("auth-changed"));

    navigate("/auth/login", { replace: true });
  };

  const go = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  const SideNav = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col flex-grow bg-white">
      {/* Logo / header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          <div className="leading-tight">
            <div className="text-lg font-bold">Admin Panel</div>
            <div className="text-xs text-muted-foreground">
              Platform Administration
            </div>
          </div>
        </div>

        {mobile ? (
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      {/* Role badge */}
      <div className="px-4 py-4">
        <Badge variant="destructive" className="w-full justify-center">
          Platform Administrator
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 pb-4">
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Button
              key={item.name}
              variant={active ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                active ? "font-medium" : ""
              }`}
              onClick={() => go(item.href)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="flex-1 text-left">{item.name}</span>

              {item.badge ? (
                <span className="ml-auto">
                  <Badge variant="secondary">{item.badge}</Badge>
                </span>
              ) : null}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>BizManager</span>
          <span>v1.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
            <SideNav mobile />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r bg-white">
        <SideNav />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 border-b border-gray-200 bg-white">
          <Button
            variant="ghost"
            className="px-4 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-2">
              {/* You can add breadcrumbs here later */}
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>PA</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm">
                      Platform Admin
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Administration</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
    </div>
  );
}