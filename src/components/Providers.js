"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { ToastProvider } from "@/components/ToastProvider";

export default function Providers({ children }) {
  return (
    <ToastProvider>
      <PreferencesProvider>
        <AuthProvider>{children}</AuthProvider>
      </PreferencesProvider>
    </ToastProvider>
  );
}
