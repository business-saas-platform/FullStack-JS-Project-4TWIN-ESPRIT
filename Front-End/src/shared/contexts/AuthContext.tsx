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
  id: string; // ✅ UUID
  name: string;
  email: string;
  role: string; // platform_admin | business_owner | ...
  businessId?: string | null; // ✅ UUID
  mustChangePassword?: boolean; // ✅ optional
  lockedUntil?: string | null; // ✅ optional
};

type LoginResult = {
  user: User;
  mustChangePassword?: boolean;
};

type AuthState = {
  user: User | null;
  isReady: boolean;

  // ✅ now supports captchaToken and returns mustChangePassword
  login: (email: string, password: string, captchaToken?: string) => Promise<LoginResult>;

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    businessId?: string;
  }) => Promise<User>;

  acceptInvite: (payload: { token: string; password: string }) => Promise<User>;

  // ✅ new: first-login password change
  changePasswordFirst: (newPassword: string) => Promise<User>;

  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const USER_KEY = "auth_user";
const TOKEN_KEY = "access_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [isReady, setReady] = useState(false);

  const syncMe = async (): Promise<User> => {
    const me = (await AuthApi.me()) as User;
    setUser(me);
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
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
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isReady,

      login: async (email, password, captchaToken) => {
        // backend returns: { access_token, user, mustChangePassword }
        const res: any = await AuthApi.login(email, password, captchaToken);

        // ✅ token
        localStorage.setItem(TOKEN_KEY, res.access_token);

        // ✅ avoid mixing business selection between users
        localStorage.removeItem("current_business_id");

        // ✅ if must change password => don't force /me if you want strict flow
        const mustChangePassword = !!res.mustChangePassword;

        if (mustChangePassword) {
          const loginUser: User = {
            ...(res.user as User),
            mustChangePassword: true,
          };

          setUser(loginUser);
          localStorage.setItem(USER_KEY, JSON.stringify(loginUser));

          window.dispatchEvent(new Event("auth-changed"));
          return { user: loginUser, mustChangePassword: true };
        }

        // ✅ normal flow: get real user/role from /me
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
        // backend returns: { ok, access_token, user }
        const res: any = await AuthApi.changePasswordFirst(newPassword);

        // update token + user
        if (res?.access_token) {
          localStorage.setItem(TOKEN_KEY, res.access_token);
        }

        // after change, mustChangePassword false
        const updatedUser: User = {
          ...(res.user as User),
          mustChangePassword: false,
        };

        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        // reset business selection (safe)
        localStorage.removeItem("current_business_id");

        window.dispatchEvent(new Event("auth-changed"));
        return updatedUser;
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem("current_business_id");
        setUser(null);

        window.dispatchEvent(new Event("auth-changed"));
      },
    }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
