import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Signin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      await signIn(username, password);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-black px-6 py-16 text-white">
      <Card className="mx-auto max-w-md border-white/10 bg-zinc-950 p-8 text-white">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to continue creating.</p>
        <div className="mt-8 space-y-4">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button className="w-full" disabled={loading} onClick={submit}>{loading ? "Signing in..." : "Sign in"}</Button>
          <p className="text-center text-sm text-zinc-400">New to HiggsFlow? <Link className="text-white underline" to="/signup">Create an account</Link></p>
        </div>
      </Card>
    </main>
  );
}
