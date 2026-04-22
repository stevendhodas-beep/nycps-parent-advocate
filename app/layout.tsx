import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({ subsets: ["latin"] });

// Loaded globally so SVG text elements inside components can reference it
const nunito = Nunito({
  weight: ["900"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

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
      <body className={`${inter.className} ${nunito.variable}`}><Providers>{children}</Providers></body>
    </html>
  );
}
