"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import { Toaster } from "sonner";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      {children}
      {/*
        Without this every toast.*() call in the app is silently dropped.
        Imported from sonner directly rather than components/ui/sonner, whose
        useTheme() has no ThemeProvider and whose classNames are all undefined
        Tailwind tokens. The app is light-only.
      */}
      <Toaster theme="light" richColors position="bottom-right" />
    </UserProvider>
  );
}
