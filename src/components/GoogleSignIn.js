"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function GoogleSignIn({ onSuccess, onError }) {
  const { signInWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;

    let active = true;
    const renderButton = () => {
      if (!active || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            await signInWithGoogle(credential);
            onSuccess();
          } catch (error) {
            onError(error.message);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 360,
      });
      setReady(true);
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      const script = existing || document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderButton);
      if (!existing) document.head.appendChild(script);
      return () => {
        active = false;
        script.removeEventListener("load", renderButton);
      };
    }

    return () => {
      active = false;
    };
  }, [clientId, onError, onSuccess, signInWithGoogle]);

  if (!clientId) {
    return <p className="oauth-note">Google sign-in can be enabled by adding a Google OAuth client ID to the environment settings.</p>;
  }

  return <div className={`google-signin${ready ? " google-ready" : ""}`} ref={buttonRef} aria-label="Continue with Google" />;
}
