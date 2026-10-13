"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePreferences } from "@/components/PreferencesProvider";
import { useToast } from "@/components/ToastProvider";
import ThemeToggle from "@/components/ThemeToggle";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, status, signOut } = useAuth();
  const { wishlist } = usePreferences();
  const { showToast } = useToast();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      setProfileOpen(false);
      showToast("You are signed out. Come back anytime.");
      router.push("/");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="Pawfect Home, home">
          <span className="brand-mark" aria-hidden="true">
            p
          </span>
          <span>
            Pawfect<span className="brand-light">Home</span>
            <small>Every pet deserves a family</small>
          </span>
        </Link>
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={`main-nav${menuOpen ? " nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/pets" onClick={() => setMenuOpen(false)}>
            Find a pet
          </Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
            Saved pets
            {wishlist.length > 0 && (
              <span className="saved-count">{wishlist.length}</span>
            )}
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard#requests"
                onClick={() => setMenuOpen(false)}
              >
                My requests
              </Link>
              <Link
                href="/dashboard#add-pet"
                onClick={() => setMenuOpen(false)}
              >
                List a pet
              </Link>
            </>
          )}
          {status === "loading" ? (
            <span
              className="nav-loading"
              aria-label="Checking your sign-in status"
            />
          ) : user ? (
            <div className="profile-menu">
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt=""
                    width={31}
                    height={31}
                    className="profile-trigger-image"
                    unoptimized
                  />
                ) : (
                  <span className="avatar-fallback">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{user.name.split(" ")[0]}</span>
                <span aria-hidden="true">⌄</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <p>
                    Signed in as <strong>{user.email}</strong>
                  </p>
                  <Link href="/dashboard" onClick={() => setProfileOpen(false)}>
                    Your dashboard
                  </Link>
                  <button onClick={handleSignOut}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="button button-small button-dark"
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              Sign in <span aria-hidden="true">↗</span>
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
