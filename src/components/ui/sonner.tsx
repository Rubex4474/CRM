"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
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
