import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Investment portfolio dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body className="antialiased bg-gray-950 font-sans">{children}</body>
    </html>
  );
}
