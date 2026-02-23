import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { mockInvoices, mockExpenses } from "@/app/lib/mockData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { toast } from "sonner";
import { useState } from "react";

export function Reports() {
  const [period, setPeriod] = useState("6months");

  // Calculate metrics
  const totalRevenue = mockInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const totalExpenses = mockExpenses
    .filter((exp) => exp.status === "approved")
    .reduce((sum, exp) => sum + exp.amount, 0);

  const profitLoss = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profitLoss / totalRevenue) * 100 : 0;

  // Monthly data
  const monthlyData = [
    { month: "Sep", revenue: 12500, expenses: 3200, profit: 9300 },
    { month: "Oct", revenue: 15800, expenses: 4100, profit: 11700 },
    { month: "Nov", revenue: 18200, expenses: 3800, profit: 14400 },
    { month: "Dec", revenue: 21500, expenses: 4500, profit: 17000 },
    { month: "Jan", revenue: 24300, expenses: 5200, profit: 19100 },
    { month: "Feb", revenue: 28900, expenses: 2868, profit: 26032 },
  ];

  // Expense breakdown
  const expenseByCategory = [
    { name: "Software", value: 648, color: "#3b82f6" },
    { name: "Office Supplies", value: 1250, color: "#10b981" },
    { name: "Marketing", value: 850, color: "#f59e0b" },
    { name: "Travel", value: 120, color: "#8b5cf6" },
  ];

  // Revenue by client (top 5)
  const revenueByClient = [
    { name: "Global Trade Inc", revenue: 14875 },
    { name: "Consulting Partners", revenue: 19992 },
    { name: "Digital Marketing Pro", revenue: 9996 },
    { name: "E-Commerce Solutions", revenue: 6664 },
    { name: "Others", revenue: 3000 },
  ];

  const handleExport = (type: string) => {
    toast.success(`Exporting report as ${type.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Financial reports and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{totalRevenue.toFixed(2)} TND</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 18.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">{totalExpenses.toFixed(2)} TND</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">↓ 8.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className="text-2xl font-bold mt-1">{profitLoss.toFixed(2)} TND</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">↑ 24.3% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profit Margin</p>
                <p className="text-2xl font-bold mt-1">{profitMargin.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-indigo-600 mt-2">↑ 2.1% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value} TND`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Client */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByClient} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (TND)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Statement */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profit & Loss Statement</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Revenue</span>
              <span className="font-semibold text-green-600">
                {totalRevenue.toFixed(2)} TND
              </span>
            </div>
            <div className="pl-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid Invoices</span>
                <span>{totalRevenue.toFixed(2)} TND</span>
              </div>
            </div>

            <div className="flex justify-between border-b pb-2 pt-2">
              <span className="font-semibold">Expenses</span>
              <span className="font-semibold text-red-600">
                {totalExpenses.toFixed(2)} TND
              </span>
            </div>
            <div className="pl-4 space-y-2">
              {expenseByCategory.map((cat) => (
                <div key={cat.name} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cat.name}</span>
                  <span>{cat.value.toFixed(2)} TND</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t-2 pt-4">
              <span className="text-lg font-bold">Net Profit</span>
              <span
                className={`text-lg font-bold ${
                  profitLoss >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {profitLoss.toFixed(2)} TND
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
