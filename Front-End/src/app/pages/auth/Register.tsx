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
      await RegistrationRequestsApi.create({
        ownerName,
        ownerEmail,
        companyName,
        companyCategory,
      });

      toast.success("Request sent!", {
        description:
          "The admin will review your request. You will receive an email.",
      });

      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      toast.error("Error", {
        description: err?.message || "Could not send request",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Business Account</CardTitle>
        <CardDescription>
          Your request must be approved by the platform admin.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="ownerName">Full Name</Label>
            <Input
              id="ownerName"
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
              value={formData.ownerEmail}
              onChange={(e) =>
                setFormData({ ...formData, ownerEmail: e.target.value })
              }
              required
            />
          </div>

          <div className="border-t pt-4" />

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyCategory">Company Category</Label>
            <Input
              id="companyCategory"
              value={formData.companyCategory}
              onChange={(e) =>
                setFormData({ ...formData, companyCategory: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Send Request
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
