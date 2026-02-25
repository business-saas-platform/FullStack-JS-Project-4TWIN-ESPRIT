// src/shared/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AuthApi } from "@/shared/lib/services/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string | null;

  // backend: ["invoices.read", ...] or ["*"]
  permissions?: string[];

  mustChangePassword?: boolean;
  lockedUntil?: string | null;
};

type LoginResult = {
  user: User;
  mustChangePassword?: boolean;
};

type AuthState = {
  user: User | null;
  isReady: boolean;

  login: (email: string, password: string, captchaToken?: string) => Promise<LoginResult>;

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    businessId?: string;
  }) => Promise<User>;

  acceptInvite: (payload: { token: string; password: string }) => Promise<User>;

  changePasswordFirst: (newPassword: string) => Promise<User>;

  logout: () => void;

  // helpers
  hasPermission: (perm: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const USER_KEY = "auth_user";
const TOKEN_KEY = "access_token";

function normalizePermissions(input: any): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
}

function safeParseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    if (!u) return null;
    return {
      ...u,
      permissions: normalizePermissions(u.permissions),
    } as User;
  } catch {
    return null;
  }
}

// normalize "invoices:read" <-> "invoices.read"
function permVariants(p: string): string[] {
  const a = p.trim();
  if (!a) return [];
  const dot = a.replace(/:/g, ".");
  const colon = a.replace(/\./g, ":");
  return Array.from(new Set([a, dot, colon]));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => safeParseUser(localStorage.getItem(USER_KEY)));
  const [isReady, setReady] = useState(false);

  const persistUser = (u: User | null) => {
    setUser(u);
    if (!u) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const syncMe = async (): Promise<User> => {
    const me = (await AuthApi.me()) as User;
    const normalized: User = {
      ...me,
      permissions: normalizePermissions((me as any).permissions),
    };
    persistUser(normalized);
    return normalized;
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }

    syncMe()
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("current_business_id");
        persistUser(null);
      })
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(() => {
    const perms = normalizePermissions(user?.permissions);

    const isSuper =
      user?.role === "platform_admin" || user?.role === "business_owner";

    const hasPermission = (perm: string) => {
      if (!user) return false;
      if (isSuper) return true;

      // wildcard
      if (perms.includes("*")) return true;

      // support ":" and "."
      const variants = permVariants(perm);
      return variants.some((v) => perms.includes(v));
    };

    const hasAnyPermission = (list: string[]) => {
      if (!user) return false;
      if (isSuper) return true;
      if (perms.includes("*")) return true;

      return list.some((p) => hasPermission(p));
    };

    const hasAllPermissions = (list: string[]) => {
      if (!user) return false;
      if (isSuper) return true;
      if (perms.includes("*")) return true;

      return list.every((p) => hasPermission(p));
    };

    return {
      user,
      isReady,

      hasPermission,
      hasAnyPermission,
      hasAllPermissions,

      login: async (email, password, captchaToken) => {
        const res: any = await AuthApi.login(email, password, captchaToken);

        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.removeItem("current_business_id");

        const mustChangePassword = !!res.mustChangePassword;

        if (mustChangePassword) {
          const loginUser: User = {
            ...(res.user as User),
            mustChangePassword: true,
            permissions: normalizePermissions(res?.user?.permissions),
          };

          persistUser(loginUser);
          window.dispatchEvent(new Event("auth-changed"));
          return { user: loginUser, mustChangePassword: true };
        }

        const me = await syncMe();
        window.dispatchEvent(new Event("auth-changed"));
        return { user: me, mustChangePassword: false };
      },

      register: async (payload) => {
        const res: any = await AuthApi.register(payload);
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.removeItem("current_business_id");

        const me = await syncMe();
        window.dispatchEvent(new Event("auth-changed"));
        return me;
      },

      acceptInvite: async (payload) => {
        const res: any = await AuthApi.acceptInvite(payload as any);
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.removeItem("current_business_id");

        const me = await syncMe();
        window.dispatchEvent(new Event("auth-changed"));
        return me;
      },

      changePasswordFirst: async (newPassword) => {
        const res: any = await AuthApi.changePasswordFirst(newPassword);

        if (res?.access_token) {
          localStorage.setItem(TOKEN_KEY, res.access_token);
        }

        const me = await syncMe();
        const updatedUser: User = { ...me, mustChangePassword: false };

        persistUser(updatedUser);
        localStorage.removeItem("current_business_id");

        window.dispatchEvent(new Event("auth-changed"));
        return updatedUser;
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("current_business_id");
        persistUser(null);
        window.dispatchEvent(new Event("auth-changed"));
      },
    };
  }, [user, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}