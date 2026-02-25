import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

import type { Business } from "@/shared/lib/mockData";
import { BusinessesApi } from "@/shared/lib/services/businesses";
import { useAuth } from "@/shared/contexts/AuthContext";

type BusinessState = {
  businesses: Business[];
  isReady: boolean;

  currentBusinessId: string | null;
  setCurrentBusinessId: (id: string | null) => void;

  currentBusiness: Business | null;
  setCurrentBusiness: (b: Business | null) => void;

  refreshBusinesses: () => Promise<void>;
};

const BusinessContext = createContext<BusinessState | undefined>(undefined);

const KEY = "current_business_id";

function readStoredBusinessId() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  if (raw === "null" || raw === "undefined") return null;
  const v = raw.trim();
  return v.length ? v : null;
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isReady, setReady] = useState(false);

  const [currentBusinessId, setCurrentBusinessIdState] = useState<string | null>(
    () => readStoredBusinessId()
  );

  const setCurrentBusinessId = useCallback((id: string | null) => {
    setCurrentBusinessIdState(id);

    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);

    window.dispatchEvent(new Event("business-changed"));
  }, []);

  const setCurrentBusiness = useCallback(
    (b: Business | null) => {
      setCurrentBusinessId(b ? String((b as any).id) : null);
    },
    [setCurrentBusinessId]
  );

  const refreshBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusinessIdState(null);
      localStorage.removeItem(KEY);
      return;
    }

    // ✅ OWNER: multiple businesses
    if (user.role === "business_owner") {
      const list = await BusinessesApi.listMine();
      setBusinesses(list);

      const storedId = readStoredBusinessId();
      const nextId =
        storedId && list.some((b: any) => String(b.id) === String(storedId))
          ? String(storedId)
          : list[0]
          ? String((list[0] as any).id)
          : null;

      setCurrentBusinessIdState(nextId);
      if (nextId) localStorage.setItem(KEY, nextId);
      else localStorage.removeItem(KEY);

      return;
    }

    // ✅ NON-OWNER: single business from user.businessId
    const bid = (user as any).businessId ? String((user as any).businessId) : null;

    setCurrentBusinessIdState(bid);
    if (bid) localStorage.setItem(KEY, bid);
    else localStorage.removeItem(KEY);

    // ✅ IMPORTANT: fetch business so UI shows it (switcher + name)
    if (bid) {
      try {
        const b = await BusinessesApi.getById(bid);
        setBusinesses([b]);
      } catch {
        // invalid or not accessible
        setBusinesses([]);
        setCurrentBusinessIdState(null);
        localStorage.removeItem(KEY);
      }
    } else {
      setBusinesses([]);
    }
  }, [user]);

  // initial + when user changes
  useEffect(() => {
    if (!authReady) return;

    refreshBusinesses()
      .catch(() => setBusinesses([]))
      .finally(() => setReady(true));
  }, [authReady, user?.id, user?.role, (user as any)?.businessId, refreshBusinesses]);

  // auth-changed => reload businesses
  useEffect(() => {
    const onAuthChanged = () => {
      refreshBusinesses().catch(() => null);
    };
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, [refreshBusinesses]);

  // business-changed => just update currentBusinessId from storage (DON’T refetch)
  useEffect(() => {
    const onBusinessChanged = () => {
      setCurrentBusinessIdState(readStoredBusinessId());
    };
    window.addEventListener("business-changed", onBusinessChanged);
    return () => window.removeEventListener("business-changed", onBusinessChanged);
  }, []);

  const currentBusiness = useMemo(() => {
    if (!currentBusinessId) return null;
    return (
      businesses.find((b: any) => String(b.id) === String(currentBusinessId)) || null
    );
  }, [businesses, currentBusinessId]);

  const value = useMemo<BusinessState>(
    () => ({
      businesses,
      isReady,
      currentBusinessId,
      setCurrentBusinessId,
      currentBusiness,
      setCurrentBusiness,
      refreshBusinesses,
    }),
    [
      businesses,
      isReady,
      currentBusinessId,
      setCurrentBusinessId,
      currentBusiness,
      setCurrentBusiness,
      refreshBusinesses,
    ]
  );

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}

export function useBusinessContext() {
  return useBusiness();
}