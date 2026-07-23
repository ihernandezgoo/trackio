import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Shell from "@/components/Shell";
import ScriptTema from "@/components/ScriptTema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trackio · Registro de peso",
  description: "Lleva el control de tu peso diario",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#14181f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-full flex justify-center bg-[var(--background)] text-[var(--foreground)] sm:py-10">
        <Shell>
          <div className="flex-1">{children}</div>
          <Nav />
        </Shell>
      </body>
    </html>
  );
}
