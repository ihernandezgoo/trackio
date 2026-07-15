import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
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
    >
      <body className="min-h-full flex justify-center bg-[var(--background)] text-[var(--foreground)] sm:py-8">
        <div className="flex min-h-full w-full max-w-md flex-col bg-[var(--background)] sm:min-h-[844px] sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-black/10 sm:ring-1 sm:ring-[var(--border)]">
          <div className="flex-1">{children}</div>
          <Nav />
        </div>
      </body>
    </html>
  );
}
