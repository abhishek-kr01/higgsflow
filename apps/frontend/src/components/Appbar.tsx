import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";

export function Appbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">HiggsFlow</Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">Dashboard</Link>
              <Link to="/video-creator" className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">Create Video</Link>
              <span className="px-2 text-sm text-zinc-500">{user.username}</span>
              <Button variant="outline" onClick={() => { signOut(); navigate("/"); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/signin")}>Sign in</Button>
              <Button onClick={() => navigate("/signup")}>Get started</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
