import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useNavigate } from "react-router";
import {
  DollarSign,
  FileText,
  Receipt,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Target,
  ChevronRight,
} from "lucide-react";
import { mockInvoices, mockExpenses, mockClients, mockAIInsights } from "@/app/lib/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function Dashboard() {
  const navigate = useNavigate();

  // Calculate metrics
  const totalRevenue = mockInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const pendingRevenue = mockInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalExpenses = mockExpenses
    .filter((exp) => exp.status === "approved")
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalClients = mockClients.length;
  
  // Get top AI insights
  const topAIInsights = mockAIInsights.slice(0, 3);
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return TrendingUp;
      case "warning":
        return AlertTriangle;
      case "recommendation":
        return Lightbulb;
      case "opportunity":
        return Target;
      default:
        return Sparkles;
    }
  };
  
  const getInsightColor = (type: string) => {
    switch (type) {
      case "prediction":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "recommendation":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "opportunity":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Revenue trend data (mock monthly data)
  const revenueTrendData = [
    { month: "Sep", revenue: 12500, expenses: 3200 },
    { month: "Oct", revenue: 15800, expenses: 4100 },
    { month: "Nov", revenue: 18200, expenses: 3800 },
    { month: "Dec", revenue: 21500, expenses: 4500 },
    { month: "Jan", revenue: 24300, expenses: 5200 },
    { month: "Feb", revenue: 28900, expenses: 2868 },
  ];

  // Invoice status distribution
  const invoiceStatusData = [
    { name: "Paid", value: mockInvoices.filter((i) => i.status === "paid").length, color: "#10b981" },
    { name: "Sent", value: mockInvoices.filter((i) => i.status === "sent").length, color: "#3b82f6" },
    { name: "Overdue", value: mockInvoices.filter((i) => i.status === "overdue").length, color: "#ef4444" },
    { name: "Draft", value: mockInvoices.filter((i) => i.status === "draft").length, color: "#6b7280" },
  ];

  // Recent invoices
  const recentInvoices = mockInvoices.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business performance</p>
      </div>
      
      {/* AI Insights Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Business Insights</h3>
              <p className="text-sm text-white/90 mt-1">
                Your AI assistant has analyzed your business data and found {mockAIInsights.length} actionable insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRevenue.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices.filter((i) => i.status === "sent" || i.status === "overdue").length} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500">-3.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+2</span> new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Insights Section */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <CardTitle>AI Business Insights</CardTitle>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700">Powered by AI</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAIInsights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);
              
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 ${colorClass} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white/80">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <Badge variant="secondary" className="ml-2">
                          {insight.confidence}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type} • {insight.category.replace("_", " ")}
                        </Badge>
                        {insight.actionable && (
                          <Button size="sm" variant="ghost" className="h-8">
                            {insight.action}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              View all {mockAIInsights.length} AI insights in your assistant
            </p>
            <p className="text-xs text-gray-400">
              AI insights updated every 6 hours based on your business data
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/invoices")}
              className="text-indigo-600"
            >
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">{invoice.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.total.toFixed(2)} TND</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "sent"
                          ? "bg-blue-100 text-blue-800"
                          : invoice.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Clients</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/clients")}
              className="text-indigo-600"
            >
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients
                .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
                .slice(0, 5)
                .map((client) => (
                  <div key={client.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{client.totalInvoiced.toFixed(2)} TND</p>
                      {client.outstandingBalance > 0 && (
                        <p className="text-xs text-orange-600">
                          Outstanding: {client.outstandingBalance.toFixed(2)} TND
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => navigate("/invoices/create")} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button onClick={() => navigate("/expenses/create")} variant="outline" className="w-full">
              <Receipt className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button onClick={() => navigate("/clients")} variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            <Button onClick={() => navigate("/reports")} variant="outline" className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}