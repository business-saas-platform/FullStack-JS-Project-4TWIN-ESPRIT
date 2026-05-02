import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIService } from "@/shared/lib/services/ai";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Search,
  Filter,
  BarChart3,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  Receipt,
  FileText,
  Users,
  Activity,
} from "lucide-react";

type CoachPriority = "low" | "medium" | "high" | string;

type CoachAdvice = {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: CoachPriority;
  action?: string;
  actionUrl?: string;
  score?: number;
  createdAt?: string;
};

type FilterPriority = "all" | "high" | "medium" | "low";

function normalizeCoachResponse(response: any): CoachAdvice[] {
  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.advices)
    ? response.advices
    : Array.isArray(response?.recommendations)
    ? response.recommendations
    : Array.isArray(response?.data)
    ? response.data
    : [];

  return items.filter(Boolean).map((item: any, index: number) => ({
    id: String(item.id || `coach-${index}`),
    title: item.title || "AI Recommendation",
    message: item.message || item.description || "",
    category: item.category || "operations",
    priority: item.priority || "medium",
    action: item.action || item.actionLabel || "Voir détails",
    actionUrl: item.actionUrl || item.action_url || "",
    score: Number(item.score || 0),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
  }));
}

function priorityClass(priority: string) {
  const value = priority.toLowerCase();

  if (value === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (value === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function priorityLabel(priority: string) {
  const value = priority.toLowerCase();

  if (value === "high") return "Haute";
  if (value === "medium") return "Moyenne";
  if (value === "low") return "Faible";

  return priority;
}

function categoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("cash")) return Activity;
  if (value.includes("risk")) return ShieldAlert;
  if (value.includes("expense") || value.includes("dépense") || value.includes("depense")) {
    return Receipt;
  }
  if (value.includes("invoice") || value.includes("facture")) return FileText;
  if (value.includes("client")) return Users;
  if (value.includes("growth")) return TrendingUp;

  return Lightbulb;
}

function calculateAiScore(advices: CoachAdvice[]) {
  if (advices.length === 0) return 100;

  const penalty = advices.reduce((total, item) => {
    const priority = item.priority.toLowerCase();

    if (priority === "high") return total + 18;
    if (priority === "medium") return total + 10;
    return total + 4;
  }, 0);

  return Math.max(0, Math.min(100, 100 - penalty));
}

export default function AICoach() {
  const navigate = useNavigate();
  const { currentBusinessId } = useBusinessContext();

  const [advices, setAdvices] = useState<CoachAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const unique = new Set(advices.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [advices]);

  const filteredAdvices = useMemo(() => {
    return advices.filter((item) => {
      const searchText = `${item.title} ${item.message} ${item.category} ${item.priority}`
        .toLowerCase()
        .trim();

      const matchesSearch = searchText.includes(search.toLowerCase().trim());

      const matchesPriority =
        priorityFilter === "all" ||
        item.priority.toLowerCase() === priorityFilter;

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [advices, search, priorityFilter, categoryFilter]);

  const highPriorityCount = useMemo(() => {
    return advices.filter((item) => item.priority.toLowerCase() === "high").length;
  }, [advices]);

  const mediumPriorityCount = useMemo(() => {
    return advices.filter((item) => item.priority.toLowerCase() === "medium").length;
  }, [advices]);

  const aiScore = useMemo(() => calculateAiScore(advices), [advices]);

  const topAdvice = useMemo(() => {
    const high = advices.find((item) => item.priority.toLowerCase() === "high");
    if (high) return high;

    const medium = advices.find((item) => item.priority.toLowerCase() === "medium");
    if (medium) return medium;

    return advices[0];
  }, [advices]);

  async function loadCoach() {
    if (!currentBusinessId) {
      setError("Aucun business actif sélectionné.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await AIService.getAICoach(currentBusinessId);
      setAdvices(normalizeCoachResponse(response));
    } catch (err: any) {
      console.error("AI Coach error:", err);
      setError(err?.message || "Erreur lors du chargement du AI Coach.");
      setAdvices([]);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysisAndRefresh() {
    if (!currentBusinessId) {
      setError("Aucun business actif sélectionné.");
      return;
    }

    try {
      setError("");
      setRunningAnalysis(true);

      if (typeof AIService.runAnalysis === "function") {
        await AIService.runAnalysis(currentBusinessId);
      }

      await loadCoach();
    } catch (err: any) {
      console.error("AI analysis error:", err);
      setError(err?.message || "Erreur lors du lancement de l’analyse AI.");
    } finally {
      setRunningAnalysis(false);
    }
  }

  function handleAdviceAction(item: CoachAdvice) {
    const action = String(item.action || "").toLowerCase();
    const category = String(item.category || "").toLowerCase();

    if (item.actionUrl) {
      navigate(item.actionUrl);
      return;
    }

    if (
      action.includes("report") ||
      action.includes("rapport") ||
      action.includes("reports")
    ) {
      navigate("/dashboard/ai-report");
      return;
    }

    if (
      action.includes("facture") ||
      action.includes("invoice") ||
      category.includes("invoice") ||
      category.includes("facture")
    ) {
      navigate("/dashboard/invoices");
      return;
    }

    if (
      action.includes("dépense") ||
      action.includes("depense") ||
      action.includes("expense") ||
      category.includes("expense") ||
      category.includes("dépense") ||
      category.includes("depense")
    ) {
      navigate("/dashboard/expenses");
      return;
    }

    if (action.includes("client") || category.includes("client")) {
      navigate("/dashboard/clients");
      return;
    }

    if (category.includes("cash")) {
      navigate("/dashboard/cash-flow-forecast");
      return;
    }

    if (category.includes("risk") || category.includes("risque")) {
      navigate("/dashboard/invoice-late-risk");
      return;
    }

    navigate("/dashboard/ai-report");
  }

  useEffect(() => {
    loadCoach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusinessId]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/20 p-4">
              <Bot className="h-8 w-8 text-blue-300" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">AI Business Coach</h1>
              <p className="mt-1 text-slate-300">
                Conseils automatiques pour améliorer le business, le cash flow et les ventes.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={runAnalysisAndRefresh}
              disabled={runningAnalysis || loading || !currentBusinessId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              <PlayCircle className={`h-4 w-4 ${runningAnalysis ? "animate-pulse" : ""}`} />
              {runningAnalysis ? "Analyse..." : "Lancer analyse AI"}
            </button>

            <button
              onClick={loadCoach}
              disabled={loading || runningAnalysis || !currentBusinessId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Coach
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 md:flex-row md:items-center md:justify-between">
          <span>{error}</span>

          <button
            onClick={loadCoach}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Score AI</p>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">{aiScore}%</p>

          <p className="mt-1 text-sm text-slate-500">
            {aiScore >= 80
              ? "Situation stable"
              : aiScore >= 50
              ? "À surveiller"
              : "Risque élevé"}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total conseils</p>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">{advices.length}</p>
          <p className="mt-1 text-sm text-slate-500">
            {filteredAdvices.length} affiché(s)
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Priorité haute</p>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {highPriorityCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {mediumPriorityCount} priorité moyenne
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Business actif</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>

          <p className="mt-3 truncate text-3xl font-bold text-slate-900">
            {currentBusinessId || "-"}
          </p>

          <p className="mt-1 text-sm text-slate-500">Connecté à l’API AI</p>
        </div>
      </div>

      {topAdvice ? (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Conseil principal
              </div>

              <h2 className="text-xl font-bold text-slate-900">{topAdvice.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {topAdvice.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAdviceAction(topAdvice)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {topAdvice.action || "Voir détails"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <Lightbulb className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recommandations AI
              </h2>
              <p className="text-sm text-slate-500">
                Actions proposées automatiquement par l’intelligence artificielle.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as FilterPriority)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Toutes catégories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 p-5"
              >
                <div className="mb-4 h-5 w-40 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : advices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-slate-500">
            Aucun conseil pour le moment. Clique sur{" "}
            <span className="font-semibold text-slate-900">Lancer analyse AI</span>{" "}
            pour générer des recommandations.
          </div>
        ) : filteredAdvices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-slate-500">
            Aucun résultat avec ces filtres.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAdvices.map((item) => {
              const Icon = categoryIcon(item.category);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="hidden rounded-2xl bg-slate-100 p-3 text-slate-700 sm:block">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {item.category}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClass(
                              item.priority
                            )}`}
                          >
                            {priorityLabel(item.priority)}
                          </span>

                          {item.score ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              Score {item.score}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-bold text-slate-900">{item.title}</h3>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdviceAction(item)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {item.action || "Voir détails"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}