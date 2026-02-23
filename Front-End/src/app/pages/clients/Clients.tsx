import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Search, Eye, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import type { Client } from "@/shared/lib/mockData";
import { useBusinessContext } from "@/shared/contexts/BusinessContext";
import { ClientsApi } from "@/shared/lib/services/clients";

export function Clients() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Tunisia",
    taxId: "",
  });

  // ✅ Load clients by business
  useEffect(() => {
    const bid = currentBusiness?.id;
    if (!bid) return;

    setIsLoading(true);
    ClientsApi.list(bid)
      .then(setClients)
      .catch(() => {
        setClients([]);
        toast.error("Impossible de charger les clients");
      })
      .finally(() => setIsLoading(false));
  }, [currentBusiness?.id]);

  const filteredClients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.taxId ?? "").toLowerCase().includes(q)
    );
  }, [clients, searchTerm]);

  const handleAddClient = async () => {
    const bid = currentBusiness?.id;
    if (!bid) {
      toast.error("Veuillez d'abord choisir une entreprise");
      return;
    }
    if (!newClient.name || !newClient.email) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      const created = await ClientsApi.create({
        businessId: bid,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone || "",
        address: newClient.address || "",
        city: newClient.city || "",
        postalCode: newClient.postalCode || "",
        country: newClient.country || "Tunisia",
        taxId: newClient.taxId || undefined,
        type: "company",
        status: "active",
      });

      setClients((prev) => [created, ...prev]);
      toast.success("Client ajouté ✅");
      setIsDialogOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Tunisia",
        taxId: "",
      });
    } catch (e: any) {
      toast.error("Erreur", { description: e?.message || "Création impossible" });
    }
  };

  // ✅ Summary (mapped to your backend fields)
  const summary = useMemo(() => {
    const totalClients = clients.length;
    const totalInvoiced = clients.reduce((sum, c) => sum + Number(c.totalRevenue ?? 0), 0);
    const outstanding = clients.reduce((sum, c) => sum + Number(c.outstandingBalance ?? 0), 0);
    const totalPaid = Math.max(totalInvoiced - outstanding, 0);
    return { totalClients, totalInvoiced, totalPaid, outstanding };
  }, [clients]);

  // ✅ No business selected
  if (!currentBusiness) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500">
          Aucune entreprise sélectionnée. Créez ou sélectionnez une entreprise.
        </p>
        <Button onClick={() => navigate("/dashboard/businesses/new")}>
          + Créer une entreprise
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client relationships — <span className="font-medium">{currentBusiness.name}</span>
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Add a new client to your database</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  placeholder="Company Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+216 ..."
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street..."
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Tunis"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="1000"
                    value={newClient.postalCode}
                    onChange={(e) => setNewClient({ ...newClient, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Tunisia"
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    placeholder="TN123..."
                    value={newClient.taxId}
                    onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClient}>Add Client</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Clients ({filteredClients.length}) {isLoading ? "— Loading..." : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.taxId || "No Tax ID"}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {client.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {client.phone || "-"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {Number(client.totalRevenue ?? 0).toFixed(2)} TND
                      </TableCell>

                      <TableCell>
                        <span
                          className={
                            Number(client.outstandingBalance ?? 0) > 0
                              ? "text-orange-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {Number(client.outstandingBalance ?? 0).toFixed(2)} TND
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Clients</div>
            <div className="text-2xl font-bold mt-1">{summary.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold mt-1">
              {summary.totalInvoiced.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Total Paid</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {summary.totalPaid.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Outstanding</div>
            <div className="text-2xl font-bold mt-1 text-orange-600">
              {summary.outstanding.toFixed(2)} TND
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
