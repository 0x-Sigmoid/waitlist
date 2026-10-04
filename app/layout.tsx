import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeDots — Connect the dots before you act",
  description: "Know what your code change affects before you ship. Join the NodeDots Code early-access waitlist.",
  openGraph: { title: "NodeDots — Connect the dots before you act", description: "Your change is part of a bigger picture. Meet NodeDots Code.", type: "website" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
