"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import LoadingState from "@/components/LoadingState";
import Link from "next/link";

export default function RequireAuth({ children }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <LoadingState label="Checking your account..." />;
  }
  if (status === "error") {
    return (
      <main className="page-container centered-page">
        <div className="empty-state">
          <span className="empty-icon">!</span>
          <h1>We couldn&apos;t check your session</h1>
          <p>Make sure the adoption service is running, then try again.</p>
          <button className="button button-dark" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }
  if (status === "anonymous") {
    return (
      <main className="page-container centered-page">
        <LoadingState label="Taking you to sign in..." />
        <Link href="/login" className="text-link">Go to sign in</Link>
      </main>
    );
  }
  return children;
}
