import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
// CORRECTION : Utilisation de l'import nommé pour éviter l'erreur SyntaxError
import { ChatWidget } from '../../shared/components/support/ChatWidget';
import {
  LayoutDashboard, FileText, Receipt, Users, UsersRound,
  BarChart3, Settings, Menu, X, LogOut, Sparkles,
  Building2, PanelLeftClose, PanelLeftOpen, LucideIcon
} from "lucide-react";

import { Button, Avatar, AvatarFallback } from "@/shared/ui";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { useAuth } from "@/shared/contexts/AuthContext";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  perm?: string;
  badge?: string;
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Sparkles, perm: "ai.read", badge: "AI" },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText, perm: "invoices.read" },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt, perm: "expenses.read" },
  { name: "Clients", href: "/dashboard/clients", icon: Users, perm: "clients.read" },
  { name: "Team", href: "/dashboard/team", icon: UsersRound, perm: "team.read" },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, perm: "reports.read" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, perm: "settings.read" },
];

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { currentBusiness, isReady } = useBusinessContext();
  const { user, logout, isReady: authReady, hasPermission } = useAuth();

  // --- DONNÉES IA (MOCK) ---
  const mockAiInsights = useMemo(() => [
    { 
      title: "Prévision de Revenus", 
      description: "Tes revenus devraient augmenter de 23% le mois prochain selon l'analyse prédictive.", 
      type: 'revenue'
    },
    { 
      title: "Alerte Trésorerie", 
      description: "Attention, 3 factures importantes sont en retard de paiement.", 
      type: 'cashflow'
    }
  ], []);

  const brandTitle = (currentBusiness as any)?.name || "BizManager";
  const pageTitle = navigation.find(n => location.pathname.startsWith(n.href))?.name || "Dashboard";

  const filteredNavigation = useMemo(() => {
    if (!user) return [];
    if (user.role === "platform_admin" || user.role === "business_owner") return navigation;
    return navigation.filter((item) => !item.perm || hasPermission(item.perm));
  }, [user, hasPermission]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  // Fermeture du menu au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!authReady || !isReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium italic">Préparation de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 
        ${sidebarCollapsed ? "w-24" : "w-72"} hidden lg:flex flex-col shadow-sm`}>
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <Building2 size={20} />
            </div>
            {!sidebarCollapsed && <span className="font-bold text-lg truncate text-slate-800">{brandTitle}</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}
              >
                <item.icon size={22} className={isActive ? "text-white" : "group-hover:text-indigo-600"} />
                {!sidebarCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors mb-2">
             {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
             {!sidebarCollapsed && <span className="text-sm font-medium">Réduire</span>}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        
        {/* Header Unifié */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">SaaS Enterprise Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left mr-2">
                  <p className="text-sm font-bold leading-none text-slate-800">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">{user?.email}</p>
                </div>
              </button>

              {/* Menu Déroulant Utilisateur */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Active</p>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Settings size={16} className="text-slate-400" /> Paramètres du Compte
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8 w-full max-w-screen-2xl mx-auto">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm min-h-[calc(100vh-12rem)] p-8 relative overflow-hidden">
             {/* Filigrane discret pour le PFE */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
               <Building2 size={200} />
            </div>
            
            <Outlet />
          </div>
        </main>
      </div>

      {/* --- WIDGET SUPPORT & IA (Persistant) --- */}
      <ChatWidget 
        user={user} 
        aiInsights={mockAiInsights} 
      />
    </div>
  );
}