import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const allowedEmail = (import.meta as any).env.VITE_ADMIN_EMAIL as string | undefined;
  const [email, setEmail] = useState<string>(allowedEmail ?? "");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirect = location.state?.from ?? "/admin";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirect, { replace: true });
    });
  }, [navigate, redirect]);

  const onLogin = async () => {
    if (allowedEmail && email !== allowedEmail) return toast.error("Unauthorized email");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast.error(error.message);
    toast.success("Welcome");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <Card className="mx-auto w-full max-w-md glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={!!allowedEmail} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="flex gap-2">
              <Button className="w-full" onClick={onLogin}>Login</Button>
            </div>
            {allowedEmail ? (
              <p className="text-xs text-muted-foreground">Only {allowedEmail} can sign in.</p>
            ) : (
              <p className="text-xs text-muted-foreground">Set VITE_ADMIN_EMAIL to restrict access.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
