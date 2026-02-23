import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { allBusinesses, mockUsageStats, businessOwners } from "@/app/lib/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Clock, Activity, TrendingUp, Users } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function Analytics() {
  // Calculate metrics
  const totalUsageTime = mockUsageStats.reduce((sum, stat) => sum + stat.totalLoginTime, 0);
  const avgUsageTime = (totalUsageTime / mockUsageStats.length).toFixed(0);
  const totalApiCalls = mockUsageStats.reduce((sum, stat) => sum + stat.apiCalls, 0);
  const activeUsers = new Set(mockUsageStats.map((stat) => stat.businessId)).size;

  // Usage by business
  const usageByBusiness = allBusinesses.map((business) => {
    const businessStats = mockUsageStats.filter((stat) => stat.businessId === business.id);
    const totalTime = businessStats.reduce((sum, stat) => sum + stat.totalLoginTime, 0);
    const totalCalls = businessStats.reduce((sum, stat) => sum + stat.apiCalls, 0);
    return {
      name: business.name.length > 15 ? business.name.substring(0, 15) + "..." : business.name,
      time: totalTime,
      apiCalls: totalCalls,
    };
  }).filter((item) => item.time > 0);

  // Plan distribution
  const planDistribution = allBusinesses.reduce((acc, business) => {
    const existing = acc.find((item) => item.name === business.plan);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: business.plan, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Status distribution
  const statusDistribution = allBusinesses.reduce((acc, business) => {
    const existing = acc.find((item) => item.name === business.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: business.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Daily usage trend
  const dailyUsage = mockUsageStats.reduce((acc, stat) => {
    const existing = acc.find((item) => item.date === stat.date);
    if (existing) {
      existing.time += stat.totalLoginTime;
      existing.users += stat.activeUsers;
      existing.invoices += stat.invoicesCreated;
    } else {
      acc.push({
        date: stat.date,
        time: stat.totalLoginTime,
        users: stat.activeUsers,
        invoices: stat.invoicesCreated,
      });
    }
    return acc;
  }, [] as { date: string; time: number; users: number; invoices: number }[]);

  // Top businesses by usage
  const topBusinesses = usageByBusiness
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive usage analytics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usage Time
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsageTime} min</div>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {avgUsageTime} min/session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total API Calls
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalApiCalls.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Platform-wide requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Businesses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              With recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Owners
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{businessOwners.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Platform users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="time" stroke="#6366f1" strokeWidth={2} name="Usage Time (min)" />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Businesses by Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBusinesses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="time" fill="#6366f1" name="Usage Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* API Calls by Business */}
      <Card>
        <CardHeader>
          <CardTitle>API Calls by Business</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByBusiness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="apiCalls" fill="#8b5cf6" name="API Calls" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
