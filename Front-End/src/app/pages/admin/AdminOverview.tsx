import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Building2, Users, TrendingUp, Activity } from "lucide-react";
import { allBusinesses, businessOwners, mockUsageStats } from "@/app/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function AdminOverview() {
  const totalBusinesses = allBusinesses.length;
  const activeBusinesses = allBusinesses.filter((b) => b.status === "active").length;
  const totalOwners = businessOwners.length;
  const totalRevenue = businessOwners.reduce((sum, owner) => sum + owner.totalRevenue, 0);

  // Usage data for charts
  const usageByDate = mockUsageStats.reduce((acc, stat) => {
    const existing = acc.find((item) => item.date === stat.date);
    if (existing) {
      existing.totalTime += stat.totalLoginTime;
      existing.apiCalls += stat.apiCalls;
    } else {
      acc.push({
        date: stat.date,
        totalTime: stat.totalLoginTime,
        apiCalls: stat.apiCalls,
      });
    }
    return acc;
  }, [] as { date: string; totalTime: number; apiCalls: number }[]);

  const businessesByPlan = allBusinesses.reduce((acc, business) => {
    const existing = acc.find((item) => item.plan === business.plan);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ plan: business.plan, count: 1 });
    }
    return acc;
  }, [] as { plan: string; count: number }[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage your Business Management SaaS platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Businesses
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalBusinesses}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeBusinesses} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Business Owners
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalOwners}</div>
            <p className="text-xs text-gray-500 mt-1">
              Platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalRevenue.toLocaleString()} TND
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across all businesses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Platform Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockUsageStats.reduce((sum, stat) => sum + stat.apiCalls, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total API calls
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Time by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalTime" stroke="#6366f1" strokeWidth={2} name="Total Time (min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Businesses by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessesByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Businesses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Active Businesses</p>
                <p className="text-sm text-gray-500">Businesses currently using the platform</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{activeBusinesses}</p>
                <p className="text-xs text-gray-500">
                  {((activeBusinesses / totalBusinesses) * 100).toFixed(0)}% of total
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Trial Businesses</p>
                <p className="text-sm text-gray-500">Businesses in trial period</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">
                  {allBusinesses.filter((b) => b.status === "trial").length}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Suspended Businesses</p>
                <p className="text-sm text-gray-500">Businesses temporarily suspended</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {allBusinesses.filter((b) => b.status === "suspended").length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
