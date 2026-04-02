import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  ChevronRight,
  Brain,
  BarChart3,
  DollarSign,
  Users,
  Receipt,
} from "lucide-react";
import { mockAIInsights, type AIInsight } from "@/app/lib/mockData";

const categoryIcons = {
  cash_flow: DollarSign,
  expenses: Receipt,
  revenue: TrendingUp,
  clients: Users,
  team: Users,
};

const categoryColors = {
  cash_flow: "bg-green-100 text-green-700",
  expenses: "bg-orange-100 text-orange-700",
  revenue: "bg-blue-100 text-blue-700",
  clients: "bg-purple-100 text-purple-700",
  team: "bg-pink-100 text-pink-700",
};

export function AIInsights() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
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

  const filteredInsights =
    selectedCategory === "all"
      ? mockAIInsights
      : mockAIInsights.filter((insight) => insight.category === selectedCategory);

  // Count insights by type
  const insightCounts = {
    predictions: mockAIInsights.filter((i) => i.type === "prediction").length,
    warnings: mockAIInsights.filter((i) => i.type === "warning").length,
    recommendations: mockAIInsights.filter((i) => i.type === "recommendation").length,
    opportunities: mockAIInsights.filter((i) => i.type === "opportunity").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            AI Business Insights
          </h1>
          <p className="mt-2 text-gray-600">
            Intelligent recommendations powered by advanced AI analysis of your business data
          </p>
        </div>
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Analysis Complete</h2>
                <p className="text-white/90">Last updated: Today at 8:00 AM</p>
              </div>
            </div>
            <p className="text-lg text-white/95 max-w-2xl">
              Our AI has analyzed your invoices, expenses, client relationships, and team performance
              to provide you with {mockAIInsights.length} actionable insights to grow your business.
            </p>
          </div>
        </div>
      </div>

      {/* Insight Type Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">{insightCounts.predictions}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-gray-900">Predictions</h3>
            <p className="text-sm text-gray-500 mt-1">Future forecasts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">{insightCounts.warnings}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-gray-900">Warnings</h3>
            <p className="text-sm text-gray-500 mt-1">Attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">{insightCounts.recommendations}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
            <p className="text-sm text-gray-500 mt-1">Suggested actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-700">{insightCounts.opportunities}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-gray-900">Opportunities</h3>
            <p className="text-sm text-gray-500 mt-1">Growth potential</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights by Category */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="cash_flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="space-y-4">
            {filteredInsights.length === 0 ? (
              <Card className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No insights available in this category</p>
              </Card>
            ) : (
              filteredInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                const colorClass = getInsightColor(insight.type);
                const CategoryIcon = categoryIcons[insight.category];
                const categoryColor = categoryColors[insight.category];

                return (
                  <Card
                    key={insight.id}
                    className={`border-2 ${colorClass} transition-all hover:shadow-lg`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {insight.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {insight.category.replace("_", " ")}
                                </Badge>
                                <Badge variant="secondary">
                                  {insight.confidence}% confidence
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`capitalize ${categoryColor}`}>
                              {insight.type}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 mb-4">{insight.description}</p>

                          {/* Actions */}
                          {insight.actionable && (
                            <div className="flex items-center justify-between pt-3 border-t">
                              <p className="text-sm text-gray-600">
                                <strong>Suggested Action:</strong> {insight.action}
                              </p>
                              <Button size="sm" className="ml-4">
                                Take Action
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="mt-3 text-xs text-gray-500">
                            Generated {new Date(insight.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Brain className="h-6 w-6 text-indigo-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">How AI Insights Work</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our AI continuously analyzes your business data including invoices, expenses, client
                interactions, and team performance. It identifies patterns, predicts trends, and
                provides actionable recommendations to help you make better business decisions.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Auto-updates every 6 hours
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Based on last 90 days of data
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Machine learning powered
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
