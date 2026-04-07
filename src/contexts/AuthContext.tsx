import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setIsAdmin(false);
          setAdminChecked(true);
        } else {
          setAdminChecked(false); // trigger admin check
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setAdminChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect for admin role check to avoid deadlock
  useEffect(() => {
    if (!user) {
      setLoading(!adminChecked);
      return;
    }
    if (adminChecked) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (!cancelled) {
          setIsAdmin(!!data);
          setAdminChecked(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminChecked(true);
          setLoading(false);
        }
      }
    };
    checkAdmin();

    return () => { cancelled = true; };
  }, [user, adminChecked]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}