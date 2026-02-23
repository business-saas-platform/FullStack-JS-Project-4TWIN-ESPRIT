import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useBusiness } from "@/shared/contexts/BusinessContext";
import { BusinessesApi } from "@/shared/lib/services/businesses";

export function RequireCompanySetup({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isReady: authReady } = useAuth();
  const { currentBusinessId, businesses, isReady: businessReady } = useBusiness();

  const [checked, setChecked] = useState(false);

  const isSetupRoute = location.pathname.startsWith("/dashboard/company/setup");

  const currentBusiness = useMemo(() => {
    if (!currentBusinessId) return null;
    return (
      (businesses as any[]).find(
        (b) => String((b as any).id) === String(currentBusinessId)
      ) || null
    );
  }, [businesses, currentBusinessId]);

  useEffect(() => {
    const run = async () => {
      if (!authReady || !businessReady) return;
      if (!user) return;

      // platform admin not concerned
      if (user.role === "platform_admin") {
        setChecked(true);
        return;
      }

      if (!currentBusinessId) {
        setChecked(true);
        return;
      }

      // best case: from list
      if (currentBusiness?.isProfileComplete === false && !isSetupRoute) {
        navigate("/dashboard/company/setup", {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }

      // fallback: fetch by id
      if (!currentBusiness) {
        try {
          const b: any = await BusinessesApi.getById(String(currentBusinessId));
          if (b?.isProfileComplete === false && !isSetupRoute) {
            navigate("/dashboard/company/setup", {
              replace: true,
              state: { from: location.pathname },
            });
            return;
          }
        } catch {
          // ignore
        }
      }

      setChecked(true);
    };

    run();
  }, [
    authReady,
    businessReady,
    user,
    currentBusinessId,
    currentBusiness,
    isSetupRoute,
    location.pathname,
    navigate,
  ]);

  if (!authReady || !businessReady || !checked) return null;
  return <>{children}</>;
}