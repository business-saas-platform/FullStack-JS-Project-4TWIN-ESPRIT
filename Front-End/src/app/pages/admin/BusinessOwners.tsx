import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import {
  MoreVertical,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Building2,
  TrendingUp,
} from "lucide-react";
import { businessOwners, allBusinesses, mockUsageStats } from "@/app/lib/mockData";

export function BusinessOwners() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<typeof businessOwners[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredOwners = businessOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "trial":
        return <Badge className="bg-yellow-100 text-yellow-800">Trial</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOwnerUsageTime = (ownerId: string) => {
    const ownerBusinesses = allBusinesses.filter((b) => b.ownerId === ownerId);
    const totalTime = mockUsageStats
      .filter((stat) => ownerBusinesses.some((b) => b.id === stat.businessId))
      .reduce((sum, stat) => sum + stat.totalLoginTime, 0);
    return totalTime;
  };

  const handleViewDetails = (owner: typeof businessOwners[0]) => {
    setSelectedOwner(owner);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Owners</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor all business owners on the platform
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owners Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Business Owners ({filteredOwners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Businesses</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Usage Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.map((owner) => {
                const usageTime = getOwnerUsageTime(owner.id);
                return (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{owner.name}</p>
                        <p className="text-sm text-gray-500">{owner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{owner.businessCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {owner.totalRevenue.toLocaleString()} TND
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{usageTime} min</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(owner.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(owner.lastActive)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(owner)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {owner.status === "active" && (
                            <DropdownMenuItem className="text-orange-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          {owner.status === "suspended" && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Owner Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Owner Details</DialogTitle>
            <DialogDescription>
              Detailed information and usage statistics
            </DialogDescription>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{selectedOwner.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedOwner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOwner.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedOwner.joinedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Businesses</p>
                  <p className="font-medium text-gray-900">{selectedOwner.businessCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="font-medium text-gray-900">
                    {selectedOwner.totalRevenue.toLocaleString()} TND
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Total Login Time</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {getOwnerUsageTime(selectedOwner.id)} min
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Last Active</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDate(selectedOwner.lastActive)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">API Calls</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {mockUsageStats
                          .filter((stat) =>
                            allBusinesses
                              .filter((b) => b.ownerId === selectedOwner.id)
                              .some((b) => b.id === stat.businessId)
                          )
                          .reduce((sum, stat) => sum + stat.apiCalls, 0)
                          .toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Businesses List */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Associated Businesses</h4>
                <div className="space-y-2">
                  {allBusinesses
                    .filter((b) => b.ownerId === selectedOwner.id)
                    .map((business) => (
                      <div
                        key={business.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{business.name}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {business.plan} plan
                          </p>
                        </div>
                        <Badge
                          className={
                            business.status === "active"
                              ? "bg-green-100 text-green-800"
                              : business.status === "trial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {business.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
