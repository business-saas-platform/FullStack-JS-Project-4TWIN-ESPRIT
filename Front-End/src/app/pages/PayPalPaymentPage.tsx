// src/front-office/pages/PayPalPaymentPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";

import { RegistrationRequestsApi } from "@/shared/lib/services/registrationRequests";
import { PaymentsApi } from "@/shared/lib/services/payments";

function getErrorMessage(err: any): string {
  const message = err?.response?.data?.message || err?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return "Une erreur est survenue";
}

function getPlanAmount(plan?: string | null) {
  const value = String(plan || "").toLowerCase();

  if (value.includes("pro")) return "29.00";
  if (value.includes("business")) return "59.00";
  if (value.includes("enterprise")) return "99.00";

  return "10.00";
}

export function PayPalPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [capturing, setCapturing] = useState(false);

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalMode = String(import.meta.env.VITE_PAYPAL_MODE || "sandbox").toLowerCase();

  const amount = useMemo(() => {
    return getPlanAmount(request?.selectedPlan);
  }, [request?.selectedPlan]);

  useEffect(() => {
    const loadRequest = async () => {
      if (!id) {
        toast.error("Identifiant de demande invalide");
        navigate("/", { replace: true });
        return;
      }

      try {
        setLoading(true);
        const data = await RegistrationRequestsApi.getPublicPaymentRequest(id);
        setRequest(data);
      } catch (err: any) {
        toast.error("Impossible de charger la demande", {
          description: getErrorMessage(err),
        });
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 rounded-2xl border bg-card px-6 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-foreground">
            Chargement du paiement PayPal...
          </span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg rounded-3xl">
          <CardHeader>
            <CardTitle>Demande introuvable</CardTitle>
            <CardDescription>
              La demande de paiement n’a pas pu être chargée.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link to="/">
              <Button className="w-full">Retour à l’accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paypalClientId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg rounded-3xl">
          <CardHeader>
            <CardTitle>Configuration PayPal manquante</CardTitle>
            <CardDescription>
              Ajoute VITE_PAYPAL_CLIENT_ID dans ton fichier .env frontend.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link to="/">
              <Button className="w-full">Retour à l’accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = request.paymentStatus === "paid";
  const isFailed = request.paymentStatus === "failed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background px-4 py-10 dark:to-background">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l’accueil
          </Link>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-border shadow-xl">
          <CardHeader className="border-b bg-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {paypalMode === "live" ? "PayPal Live" : "PayPal Sandbox"}
              </Badge>

              {request.paymentStatus && (
                <Badge
                  className={
                    request.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : request.paymentStatus === "failed"
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {request.paymentStatus}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <CardTitle className="text-2xl text-foreground">
                  Paiement PayPal
                </CardTitle>
                <CardDescription className="mt-1">
                  Paiement réel via l’API PayPal Sandbox, sans argent réel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 bg-card p-6">
            <div className="grid gap-4 rounded-2xl border border-border bg-background p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Entreprise
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {request.companyName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Propriétaire
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {request.ownerName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {request.ownerEmail}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Plan
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {request.selectedPlan || "Non défini"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Montant
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {amount} USD
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Référence
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {request.paymentReference || "—"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {paypalMode === "live" ? "Mode Live" : "Mode Sandbox"}
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    {paypalMode === "live"
                      ? "Paiement reel via PayPal. Le montant sera effectivement debite."
                      : "Utilise un compte PayPal Sandbox pour tester le paiement. Aucun vrai montant n’est débité en sandbox."}
                  </p>
                </div>
              </div>
            </div>

            {paymentError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {paymentError}
              </div>
            ) : null}

            {!isPaid && (
              <PayPalScriptProvider
                options={{
                  clientId: paypalClientId,
                  currency: "USD",
                  intent: "capture",
                }}
              >
                <div className={capturing ? "pointer-events-none opacity-60" : ""}>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      shape: "pill",
                      label: "paypal",
                    }}
                    createOrder={async (_data, actions) => {
                      if (!id) {
                        throw new Error("Registration request id manquant");
                      }

                      setPaymentError("");
                      const orderId = await actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: amount,
                            },
                            description: `Subscription ${request.selectedPlan || "starter"} - ${request.companyName}`,
                          },
                        ],
                      });
                      return orderId;
                    }}
                    onApprove={async (data) => {
                      if (!id || !data.orderID) return;

                      try {
                        setCapturing(true);
                        setPaymentError("");

                        const updated = await PaymentsApi.confirmPayPalPayment(id, {
                          orderId: data.orderID,
                        });
                        setRequest((prev: any) => ({
                          ...prev,
                          ...updated,
                        }));

                        toast.success("Paiement PayPal validé", {
                          description:
                            "Le paiement a été capturé avec succès.",
                        });

                        setTimeout(() => {
                          navigate("/auth/login");
                        }, 1200);
                      } catch (err: any) {
                        setPaymentError(getErrorMessage(err));
                        toast.error("Capture PayPal échouée", {
                          description: getErrorMessage(err),
                        });
                      } finally {
                        setCapturing(false);
                      }
                    }}
                    onCancel={() => {
                      toast.info("Paiement annulé");
                    }}
                    onError={(err) => {
                      console.error("PayPal error:", err);
                      setPaymentError(
                        "Erreur PayPal. Vérifie la configuration sandbox."
                      );
                    }}
                  />
                </div>
              </PayPalScriptProvider>
            )}

            {capturing ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Capture du paiement en cours...
              </div>
            ) : null}

            {isPaid && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Paiement validé
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Le paiement PayPal a été marqué comme payé. L’admin peut
                      maintenant approuver la demande.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isFailed && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Paiement échoué
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      Le paiement a échoué. Tu peux réessayer avec PayPal
                      Sandbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="h-12 w-full">
                  Retour accueil
                </Button>
              </Link>

              <Link to="/auth/login" className="flex-1">
                <Button className="h-12 w-full">Aller au login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}