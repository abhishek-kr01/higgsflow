import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-black text-white">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
}
