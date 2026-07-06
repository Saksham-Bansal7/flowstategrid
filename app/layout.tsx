// app/layout.tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Providers from "./providers";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlowStateGrid",
  description: "Educational platform for collaborative learning and study sessions.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}