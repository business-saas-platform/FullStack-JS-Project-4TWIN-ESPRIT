import { Link } from "react-router";
import { Building2 } from "lucide-react";
import { Button } from "@/shared/ui";

export function NavigationBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">BizManager Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <Link to="/auth/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <a href="#signup">
              <Button>Commencer</Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}