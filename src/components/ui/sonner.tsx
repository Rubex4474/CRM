"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{
        classNames: {
          toast: "rounded-lg border border-border bg-card text-card-foreground shadow-card",
          description: "text-muted-foreground",
          success: "!text-success",
          error: "!text-destructive",
        },
      }}
    />
  );
}
