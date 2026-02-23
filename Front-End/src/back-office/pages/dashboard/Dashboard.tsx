import { DollarSign, FileText, Receipt, TrendingUp } from "lucide-react";
import { StatCard } from "../../molecules/StatCard";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue sur votre tableau de bord
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus totaux"
          value="42,580 TND"
          description="Total des revenus ce mois"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Factures"
          value="128"
          description="Factures émises ce mois"
          icon={FileText}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Dépenses"
          value="18,240 TND"
          description="Total des dépenses"
          icon={Receipt}
          trend={{ value: -4.3, isPositive: false }}
        />
        <StatCard
          title="Bénéfice net"
          value="24,340 TND"
          description="Bénéfice ce mois"
          icon={TrendingUp}
          trend={{ value: 15.8, isPositive: true }}
        />
      </div>

      {/* Additional content would go here */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Charts, recent invoices, etc. */}
      </div>
    </div>
  );
}
