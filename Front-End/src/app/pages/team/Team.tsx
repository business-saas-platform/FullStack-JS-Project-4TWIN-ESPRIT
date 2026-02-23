import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Checkbox } from "@/app/components/ui/checkbox";
import { UserPlus, Mail, Shield, Trash2 } from "lucide-react";
import { roleLabels } from "@/app/lib/mockData";
import type { TeamMember } from "@/shared/lib/mockData";
import { TeamMembersApi } from "@/shared/lib/services/teamMembers";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  "invoices.read",
  "invoices.write",
  "expenses.read",
  "expenses.write",
  "clients.read",
  "clients.write",
  "team.read",
  "team.invite",
  "team.remove",
  "reports.read",
  "settings.read",
  "settings.write",
] as const;

type Permission = (typeof ALL_PERMISSIONS)[number];

export function Team() {
  const { currentBusiness } = useBusinessContext();
  const { user } = useAuth();

  const isOwner = user?.role === "business_owner"; // ✅ owner فقط

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "team_member",
  });

  // ✅ Permissions picker state
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([
    "invoices.read",
    "expenses.read",
    "clients.read",
  ]);

useEffect(() => {
  const bid = currentBusiness?.id;
  if (!bid) {
    setMembers([]);
    return;
  }

  setLoading(true);
  TeamMembersApi.list(bid)
    .then((res: any) => {
      // ✅ backend يرجّع array أو object واحد
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : res
            ? [res]
            : [];

      setMembers(list);
    })
    .catch(() => setMembers([]))
    .finally(() => setLoading(false));
}, [currentBusiness?.id]);


const businessMembers = useMemo(() => {
  const bid = currentBusiness?.id;
  if (!bid) return [];
  return (members ?? []).filter((m: any) => m?.businessId === bid);
}, [members, currentBusiness?.id]);


  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      invited: "bg-blue-100 text-blue-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return variants[status] || variants.inactive;
  };

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleInviteMember = async () => {
    try {
      if (!isOwner) {
        toast.error("Accès refusé", { description: "Seul le Business Owner peut inviter." });
        return;
      }

      const bid = currentBusiness?.id;
      if (!bid) throw new Error("Business not selected");

      if (!newMember.name.trim() || !newMember.email.trim()) {
        toast.error("Veuillez remplir le nom et l'email");
        return;
      }

      const dto: any = {
        businessId: bid,
        name: newMember.name.trim(),
        email: newMember.email.trim().toLowerCase(),
        role: newMember.role,
        status: "invited",
        permissions: selectedPermissions,
        joinedAt: new Date().toISOString(),
      };

    const created = await TeamMembersApi.invite(dto);
setMembers((prev) => [created.teamMember, ...prev]);
toast.success("Invitation envoyée! (email + lien)");

      setIsDialogOpen(false);
      setNewMember({ name: "", email: "", role: "team_member" });
      setSelectedPermissions(["invoices.read", "expenses.read", "clients.read"]);
    } catch (err: any) {
      toast.error("Erreur invitation", { description: err?.message || "Impossible d'inviter" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (!isOwner) {
        toast.error("Accès refusé", { description: "Seul le Business Owner peut supprimer." });
        return;
      }

      await TeamMembersApi.remove(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Membre supprimé");
    } catch (err: any) {
      toast.error("Erreur suppression", { description: err?.message || "Impossible de supprimer" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their permissions
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isOwner || !currentBusiness?.id}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Only the <b>Business Owner</b> can invite members.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Full Name</Label>
                <Input
                  id="member-name"
                  placeholder="Ahmed Ben Ali"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="ahmed@business.tn"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-role">Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                >
                  <SelectTrigger id="member-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_admin">Business Administrator</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Permissions picker */}
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedPermissions.includes(perm)}
                        onCheckedChange={() => togglePermission(perm)}
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {selectedPermissions.length}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} disabled={!isOwner}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Team Members ({businessMembers.length})
            {loading ? " — loading..." : ""}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {businessMembers.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {(member.name || "?")
                            .split(" ")
                            .map((n: string) => n?.[0] || "")
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span>{roleLabels?.[member.role] || member.role}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(member.permissions ?? []).slice(0, 3).map((perm: string) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {(member.permissions ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusBadge(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    {/* ✅ owner only + don't delete owner */}
                    {isOwner && member.role !== "business_owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {businessMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No team members yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
