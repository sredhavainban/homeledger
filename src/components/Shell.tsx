import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark] as const;
}

export default function Shell() {
  const [dark, setDark] = useTheme();
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4">
      <header className="flex items-center justify-between pb-4">
        <h1 className="text-lg font-semibold">HomeLedger</h1>
        <div className="flex gap-2">
          <button className="btn-quiet" onClick={() => setDark(!dark)} aria-pressed={dark}>
            {dark ? "Light theme" : "Dark theme"}
          </button>
          <button className="btn-quiet" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section aria-label="Chat" className="panel flex min-h-[22rem] flex-col p-4">
          <h2 className="font-medium">Chat</h2>
          <p className="mt-2 text-sm text-ink-soft dark:text-[#9FB0BF]">
            Type an expense like “spent 250 on groceries”. Chat arrives in phase 3.
          </p>
        </section>
        <section aria-label="Spending dashboard" className="panel p-4">
          <h2 className="font-medium">Spending</h2>
          <p className="mt-2 text-sm text-ink-soft dark:text-[#9FB0BF]">
            Daily and monthly totals, biggest expenses and category breakdown arrive in phase 2.
          </p>
        </section>
      </div>
    </div>
  );
}
