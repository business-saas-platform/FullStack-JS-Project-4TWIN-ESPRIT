import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

import {
  RegistrationRequest,
  RegistrationRequestsApi,
  RegistrationRequestStatus,
} from "@/shared/lib/services/registrationRequests";

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function Badge({ status }: { status: RegistrationRequestStatus }) {
  const cls =
    status === "pending"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : status === "approved"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
      {status}
    </span>
  );
}

export default function RegistrationRequestsAdmin() {
  const [status, setStatus] = useState<RegistrationRequestStatus>("pending");
  const [items, setItems] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchList = async (s: RegistrationRequestStatus) => {
    try {
      setLoading(true);
      const list = await RegistrationRequestsApi.list(s);
      setItems(list);
    } catch (err: any) {
      toast.error("Failed to load requests", {
        description: err?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const stats = useMemo(() => {
    const pending = items.filter((x) => x.status === "pending").length;
    const approved = items.filter((x) => x.status === "approved").length;
    const rejected = items.filter((x) => x.status === "rejected").length;
    return { pending, approved, rejected };
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((r) => {
      const s =
        `${r.ownerName} ${r.ownerEmail} ${r.companyName} ${r.companyCategory}`.toLowerCase();
      return s.includes(query);
    });
  }, [items, q]);

  const approve = async (id: string) => {
    try {
      await RegistrationRequestsApi.approve(id);
      toast.success("Approved", {
        description: "Email sent to owner with login details.",
      });
      await fetchList(status);
    } catch (err: any) {
      toast.error("Approve failed", {
        description: err?.message || "Unknown error",
      });
    }
  };

  const openReject = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectingId) return;

    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await RegistrationRequestsApi.reject(rejectingId, reason);
      toast.success("Rejected", {
        description: "Email sent to owner with rejection reason.",
      });
      cancelReject();
      await fetchList(status);
    } catch (err: any) {
      toast.error("Reject failed", {
        description: err?.message || "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Registration Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review owner signup requests. Approve to create the company + owner account, or reject with a reason.
          </p>
        </div>

        <Button variant="outline" onClick={() => fetchList(status)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            <div className="text-2xl font-semibold">{stats.pending}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
            <div className="text-2xl font-semibold">{stats.approved}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
            <div className="text-2xl font-semibold">{stats.rejected}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={status === "pending" ? "default" : "outline"}
                onClick={() => setStatus("pending")}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={status === "approved" ? "default" : "outline"}
                onClick={() => setStatus("approved")}
              >
                Approved
              </Button>
              <Button
                size="sm"
                variant={status === "rejected" ? "default" : "outline"}
                onClick={() => setStatus("rejected")}
              >
                Rejected
              </Button>
            </div>

            {/* Search */}
            <div className="ml-auto w-full md:w-[360px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by owner/company/email..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal (simple inline card) */}
      {rejectingId && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Reject Request</CardTitle>
            <CardDescription>
              This reason will be emailed to the owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection reason</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Example: Missing details, duplicate request, invalid data..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmReject}>Confirm Reject</Button>
              <Button variant="outline" onClick={cancelReject}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${filtered.length} request(s)`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                      No requests found.
                    </td>
                  </tr>
                )}

                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="font-medium">{r.companyName}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.companyCategory}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">{r.ownerName}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {r.ownerEmail}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(r.createdAt)}
                      {r.status === "rejected" && r.rejectionReason ? (
                        <div className="mt-1 text-xs text-red-600">
                          Reason: {r.rejectionReason}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-4">
                      <Badge status={r.status} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {r.status === "pending" ? (
                          <>
                            <Button size="sm" onClick={() => approve(r.id)}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReject(r.id)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => fetchList(status)}>
                            Refresh
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}