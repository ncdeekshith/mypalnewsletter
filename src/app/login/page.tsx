"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mypal.in");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    localStorage.setItem("mypal-user", JSON.stringify(data.user));
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-mypal-cloud">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="flex items-center bg-mypal-deep px-8 py-12 text-white md:px-16">
          <div className="max-w-2xl">
            <div className="mb-12 inline-flex rounded bg-white px-5 py-3 text-3xl font-black text-mypal-orange">myPAL</div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-100">Internal newsletter generator</p>
            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              Monthly updates to polished PDF in minutes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Collect team updates, review submissions, arrange sections, preview the newsletter, and export a print-ready A4 PDF.
            </p>
          </div>
        </section>

        <section className="flex items-center px-6 py-10">
          <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
            <h2 className="text-3xl font-black text-mypal-deep">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">Demo admin: admin@mypal.in / admin123</p>
            <p className="text-sm text-slate-600">Team users: academic@mypal.in / team123</p>

            <label className="mt-8 block text-sm font-bold text-slate-700">Email</label>
            <div className="mt-2 flex items-center gap-2 rounded border border-slate-200 px-3">
              <Mail size={18} className="text-slate-400" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 py-3 outline-none"
                type="email"
                required
              />
            </div>

            <label className="mt-5 block text-sm font-bold text-slate-700">Password</label>
            <div className="mt-2 flex items-center gap-2 rounded border border-slate-200 px-3">
              <LockKeyhole size={18} className="text-slate-400" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 py-3 outline-none"
                type="password"
                required
              />
            </div>

            {error ? <p className="mt-4 rounded bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

            <button
              disabled={loading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded bg-mypal-orange px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Open dashboard"}
              <ArrowRight size={18} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
