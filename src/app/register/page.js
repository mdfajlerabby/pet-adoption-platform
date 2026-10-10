"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import GoogleSignIn from "@/components/GoogleSignIn";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

export default function RegisterPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const { register, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const finishRegistration = useCallback(() => {
    showToast("Your account is ready. Let's find your new best friend.");
  }, [showToast]);

  const showRegistrationError = useCallback((message) => setError(message), []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const newPassword = form.get("password");
    if (newPassword !== form.get("confirmPassword")) {
      setError("Those passwords don't match yet. Give it another try.");
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) || newPassword.length < 6) {
      setError("Use at least 6 characters with one uppercase and one lowercase letter.");
      return;
    }

    setBusy(true);
    try {
      await register({
        name: form.get("name"),
        email: form.get("email"),
        photoURL: form.get("photoURL"),
        password: newPassword,
      });
      finishRegistration();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="A new friend starts here." subtitle="Join a community making room for more love.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">Your name<input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required placeholder="How should we call you?" /></label>
        <label className="form-field">Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label className="form-field">Profile photo URL <span className="optional-label">optional</span><input name="photoURL" type="url" placeholder="https://example.com/your-photo.jpg" /></label>
        <label className="form-field">Password<input name="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /><small className={`password-hint${password.length >= 6 && /[a-z]/.test(password) && /[A-Z]/.test(password) ? " password-valid" : ""}`}>At least 6 characters, with an uppercase and a lowercase letter.</small></label>
        <label className="form-field">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required placeholder="Type it one more time" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? "Making your account..." : "Create my account"} <span aria-hidden="true">→</span></button>
      </form>
      <div className="auth-divider"><span>or join with Google</span></div>
      <GoogleSignIn onSuccess={finishRegistration} onError={showRegistrationError} />
      <p className="auth-switch">Already part of the family? <Link href="/login">Sign in <span aria-hidden="true">→</span></Link></p>
    </AuthLayout>
  );
}
