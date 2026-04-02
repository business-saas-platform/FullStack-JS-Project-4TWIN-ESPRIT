import { Outlet } from "react-router";
import { Building2 } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <Building2 className="h-10 w-10" />
          <span className="text-2xl font-bold">BizManager Pro</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold mb-4">
            Gérez votre entreprise avec intelligence
          </h2>
          <p className="text-lg text-blue-100">
            Une plateforme SaaS multitenant complète pour la facturation, la gestion des dépenses, 
            le suivi client et la collaboration d'équipe.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-100 text-sm">Entreprises</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-blue-100 text-sm">Disponibilité</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-blue-100 text-sm">Support</div>
            </div>
          </div>
        </div>
        <div className="text-sm text-blue-100">
          © 2026 BizManager Pro. Hébergé en Tunisie.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
