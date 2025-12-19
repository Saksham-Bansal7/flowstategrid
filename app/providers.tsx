// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import QueryProvider from "./query-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}          