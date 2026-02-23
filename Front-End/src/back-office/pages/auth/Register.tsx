import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { toast } from "sonner";

import { RegistrationRequestsApi } from "@/shared/lib/services/registrationRequests";

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    companyName: "",
    companyCategory: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ownerName = formData.ownerName.trim();
    const ownerEmail = formData.ownerEmail.trim().toLowerCase();
    const companyName = formData.companyName.trim();
    const companyCategory = formData.companyCategory.trim();

    if (!ownerName || !ownerEmail || !companyName || !companyCategory) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await RegistrationRequestsApi.create({
        ownerName,
        ownerEmail,
        companyName,
        companyCategory,
      });

      toast.success("Request sent!", {
        description:
          "The admin will review your request. You will receive an email after approval.",
      });

      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message || "Could not send request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Request Business Account</CardTitle>
        <CardDescription className="text-sm">
          Submit your company request. The platform admin must approve it before you can log in.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">What happens next?</div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Your request is reviewed by the admin.</li>
            <li>If approved, you receive an email with a temporary password.</li>
            <li>You’ll change the password on your first login.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Owner info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Owner information</h3>
              <p className="text-xs text-muted-foreground">
                Use your professional email to receive the approval message.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Full name</Label>
              <Input
                id="ownerName"
                placeholder="Aziz Rahouej"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="aziz@company.tn"
                value={formData.ownerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, ownerEmail: e.target.value })
                }
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="border-t pt-5" />

          {/* Company info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Company information</h3>
              <p className="text-xs text-muted-foreground">
                Basic details are required to validate your request.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                placeholder="BizManager Solutions"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCategory">Category</Label>
              <Input
                id="companyCategory"
                placeholder="Accounting / Retail / Services / IT..."
                value={formData.companyCategory}
                onChange={(e) =>
                  setFormData({ ...formData, companyCategory: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Example: Retail, Construction, Accounting, Consulting, IT Services.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send request"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
