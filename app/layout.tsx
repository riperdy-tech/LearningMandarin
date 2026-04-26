import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mandarin Course",
  description: "Interactive Mandarin learning website for Month 1"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
