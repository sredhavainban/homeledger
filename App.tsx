import { useAuth } from "./auth/AuthProvider";
import { isConfigured } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import Shell from "./components/Shell";

export default function App() {
  const { session, loading } = useAuth();

  if (!isConfigured)
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-xl font-semibold">Supabase is not configured</h1>
        <p className="mt-2 text-sm">
          Copy <code>.env.example</code> to <code>.env</code>, add your project URL and anon key, then restart <code>npm run dev</code>.
        </p>
      </main>
    );
  if (loading) return <p className="p-8 text-sm" role="status">Loading…</p>;
  return session ? <Shell /> : <AuthPage />;
}
