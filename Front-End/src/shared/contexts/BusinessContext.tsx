import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import type { Business } from "@/shared/lib/mockData";
import { BusinessesApi } from "@/shared/lib/services/businesses";
import { useAuth } from "@/shared/contexts/AuthContext";

type BusinessState = {
  businesses: Business[];
  isReady: boolean;

  // New style (id-based)
  currentBusinessId: string | null;
  setCurrentBusinessId: (id: string | null) => void;

  // Backward-compatible (object-based)
  currentBusiness: Business | null;
  setCurrentBusiness: (b: Business | null) => void;

  refreshBusinesses: () => Promise<void>;
};

const BusinessContext = createContext<BusinessState | undefined>(undefined);

const KEY = "current_business_id";

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isReady, setReady] = useState(false);

  const [currentBusinessId, setCurrentBusinessIdState] = useState<string | null>(
    () => localStorage.getItem(KEY)
  );

  const setCurrentBusinessId = (id: string | null) => {
    setCurrentBusinessIdState(id);
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);

    window.dispatchEvent(new Event("business-changed"));
  };

  // Backward-compatible setter (accepts business object)
  const setCurrentBusiness = (b: Business | null) => {
    setCurrentBusinessId(b ? String((b as any).id) : null);
  };

  const refreshBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusinessIdState(null);
      localStorage.removeItem(KEY);
      return;
    }

    // Owner: list businesses
    if (user.role === "business_owner") {
      const list = await BusinessesApi.listMine();
      setBusinesses(list);

      const storedId = localStorage.getItem(KEY);

      // If no stored id -> pick first
      if (!storedId && list.length) {
        setCurrentBusinessIdState(String((list[0] as any).id));
        localStorage.setItem(KEY, String((list[0] as any).id));
        return;
      }

      // If stored id is invalid -> fallback
      if (storedId && list.length) {
        const exists = list.some((b: any) => String(b.id) === String(storedId));
        if (!exists) {
          setCurrentBusinessIdState(String((list[0] as any).id));
          localStorage.setItem(KEY, String((list[0] as any).id));
        } else {
          setCurrentBusinessIdState(String(storedId));
        }
      }

      // If list empty -> clear
      if (!list.length) {
        setCurrentBusinessIdState(null);
        localStorage.removeItem(KEY);
      }

      return;
    }

    // Non-owner users: single business id from user
    const bid = (user as any).businessId ? String((user as any).businessId) : null;
    setCurrentBusinessIdState(bid);
    if (bid) localStorage.setItem(KEY, bid);
    else localStorage.removeItem(KEY);

    setBusinesses([]);
  };

  useEffect(() => {
    if (!authReady) return;

    refreshBusinesses()
      .catch(() => setBusinesses([]))
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.id]);

  // Listen to auth changes
  useEffect(() => {
    const onAuthChanged = () => {
      refreshBusinesses().catch(() => null);
    };
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Listen to business changes (storage updated)
  useEffect(() => {
    const onBusinessChanged = () => {
      const stored = localStorage.getItem(KEY);
      setCurrentBusinessIdState(stored);
      refreshBusinesses().catch(() => null);
    };

    window.addEventListener("business-changed", onBusinessChanged);
    return () => window.removeEventListener("business-changed", onBusinessChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ✅ currentBusiness computed from businesses + currentBusinessId
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
    [businesses, isReady, currentBusinessId, currentBusiness]
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

// Backward-compatible alias
export function useBusinessContext() {
  return useBusiness();
}