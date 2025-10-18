import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const allowedEmail = (import.meta as any).env.VITE_ADMIN_EMAIL as string | undefined;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const email = data.session?.user?.email;
      setAuthed(!!data.session && (!allowedEmail || email === allowedEmail));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const email = session?.user?.email;
      setAuthed(!!session && (!allowedEmail || email === allowedEmail));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [allowedEmail]);

  if (loading) return null;
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

export default RequireAuth;
