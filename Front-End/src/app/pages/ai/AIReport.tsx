import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Receipt,
  FileText,
  AlertTriangle,
  Sparkles,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function AIReport() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/20 p-4">
              <BarChart3 className="h-8 w-8 text-blue-300" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">AI Business Report</h1>
              <p className="mt-1 text-slate-300">
                Rapport intelligent basé sur les recommandations AI, les revenus,
                les dépenses et les risques business.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">Statut global</p>
            <p className="mt-1 text-2xl font-bold text-green-300">Stable</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Score AI</p>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">93%</p>
          <p className="mt-1 text-sm text-slate-500">
            Bonne santé business.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Ratio dépenses</p>
            <Receipt className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">7%</p>
          <p className="mt-1 text-sm text-slate-500">
            Dépenses sous contrôle.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Factures</p>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">OK</p>
          <p className="mt-1 text-sm text-slate-500">
            Aucun risque critique.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Risque</p>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">Low</p>
          <p className="mt-1 text-sm text-slate-500">
            Situation stable.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyse AI détaillée
              </h2>
              <p className="text-sm text-slate-500">
                Résumé automatique de la situation business.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">
                Maintenir une marge saine
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Le ratio dépenses/revenus est autour de 7%. C’est un signal
                positif. Continue le suivi hebdomadaire pour éviter une dérive
                progressive des coûts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">
                Surveiller les dépenses récurrentes
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Les dépenses semblent faibles, mais les charges récurrentes
                doivent être contrôlées chaque mois pour préserver la marge.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">
                Préserver le cash flow
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Continue à suivre les factures ouvertes, les paiements à venir
                et les clients ayant un historique de retard.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-green-50 p-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Actions recommandées
              </h2>
              <p className="text-sm text-slate-500">
                Priorités proposées par l’AI.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/reports")}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Voir les rapports classiques
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Ouvrir le module Reports.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/expenses")}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Vérifier les dépenses
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Contrôler les coûts récurrents.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/invoices")}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Vérifier les factures
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Surveiller les paiements ouverts.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/cash-flow-forecast")}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">
                Voir cash flow
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Analyser les prévisions AI.
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-green-50 p-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Conclusion AI
            </h2>
            <p className="text-sm text-slate-500">
              Synthèse finale du rapport intelligent.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="font-bold text-green-800">
            Le business est actuellement en bonne santé.
          </h3>
          <p className="mt-2 text-sm leading-6 text-green-700">
            La marge est saine, les dépenses sont basses et aucun risque majeur
            n’est détecté. L’AI recommande de continuer le suivi hebdomadaire des
            dépenses, des factures et du cash flow.
          </p>
        </div>
      </div>
    </div>
  );
}