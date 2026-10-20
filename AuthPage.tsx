import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error, data } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMessage({ kind: "error", text: error.message });
    if (mode === "signup" && !data.session)
      setMessage({ kind: "info", text: "Check your email to confirm your account, then sign in." });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl font-semibold">HomeLedger</h1>
      <p className="mt-1 text-sm text-ink-soft dark:text-[#9FB0BF]">
        Tell it what you spent. It keeps the books.
      </p>
      <form onSubmit={submit} className="panel mt-6 space-y-4 p-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required autoComplete="email" className="field"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"} className="field"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {message && (
          <p role="alert" className={`text-sm ${message.kind === "error" ? "text-spend" : "text-earn"}`}>
            {message.text}
          </p>
        )}
        <button className="btn w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button className="mt-4 text-sm underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
