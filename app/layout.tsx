import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Drive the Market",
    template: "%s · Drive the Market",
  },
  description:
    "Structured trading education, controlled learning resources, and measurable student progress.",
  openGraph: {
    type: "website",
    title: "Drive the Market",
    description:
      "Structured trading education before, during, and after every live class.",
    siteName: "Drive the Market",
  },
  twitter: { card: "summary_large_image", title: "Drive the Market" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
