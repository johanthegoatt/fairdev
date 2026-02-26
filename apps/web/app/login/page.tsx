"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { requestMagicLink, verifyMagicLink } from "../../lib/api";
import { clearAuth, saveAuth } from "../../lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [devToken, setDevToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuth();
    const tokenFromUrl = new URLSearchParams(window.location.search).get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  async function onRequestLink(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await requestMagicLink(email);
      setDevToken(response.devToken ?? null);
      setMessage("Magic link issued. Check your email or paste the dev token below.");
    } catch (error: any) {
      setMessage(error?.response?.data?.error ?? "Could not request magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyToken(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await verifyMagicLink(token);
      saveAuth(response.accessToken, response.user);
      router.push("/dashboard");
    } catch (error: any) {
      setMessage(error?.response?.data?.error ?? "Invalid token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="surface p-7 reveal">
          <p className="kicker">Auth</p>
          <h1 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">Magic-link login</h1>
          <p className="mt-2 text-sm text-slate">Sign in securely to access your private analysis dashboard.</p>

          <form className="mt-6 space-y-4" onSubmit={onRequestLink}>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                className="input"
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button className="btn-accent w-full" disabled={loading} type="submit">
              Request Magic Link
            </button>
          </form>

          {devToken ? (
            <div className="mt-4 rounded-2xl border border-mint/30 bg-mint/10 p-3 text-xs">
              Dev token: <span className="break-all font-mono">{devToken}</span>
            </div>
          ) : null}
        </div>

        <div className="surface p-7 reveal reveal-1">
          <p className="kicker">Verify</p>
          <h2 className="mt-2 text-2xl font-semibold [font-family:var(--font-display)]">Paste token</h2>
          <form className="mt-6 space-y-4" onSubmit={onVerifyToken}>
            <div>
              <label className="label" htmlFor="token">
                Magic Token
              </label>
              <textarea
                className="input min-h-28 font-mono text-xs"
                id="token"
                name="token"
                value={token}
                onChange={(event) => setToken(event.target.value.trim())}
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={loading} type="submit">
              Verify and Continue
            </button>
          </form>

          {message ? <p className="mt-4 text-sm text-slate">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}