import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NYC Schools Family Advocate",
  description:
    "Your AI-powered advocate for navigating NYC Public Schools — transfers, IEPs, benefits, CEC elections, and more.",
  manifest: "/manifest.json",
  themeColor: "#1e3a8a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}><Providers>{children}</Providers></body>
    </html>
  );
}
