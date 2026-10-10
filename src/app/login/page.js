"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import GoogleSignIn from "@/components/GoogleSignIn";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user, status } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user || status !== "authenticated") return;
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/dashboard";
    router.replace(destination);
  }, [router, status, user]);

  const finishSignIn = useCallback(() => {
    showToast("Welcome back. Your next happy chapter is waiting.");
  }, [showToast]);

  const showSignInError = useCallback((message) => setError(message), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      await signIn(form.get("email"), form.get("password"));
      finishSignIn();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Good to see you." subtitle="Sign in to pick up where your happy story left off.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label className="form-field">Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark auth-submit" type="submit" disabled={busy || status === "loading"}>{busy ? "Signing you in..." : "Sign in"} <span aria-hidden="true">→</span></button>
      </form>
      <div className="auth-divider"><span>or take the easy way</span></div>
      <GoogleSignIn onSuccess={finishSignIn} onError={showSignInError} />
      <p className="auth-switch">New around here? <Link href="/register">Create an account <span aria-hidden="true">→</span></Link></p>
    </AuthLayout>
  );
}
