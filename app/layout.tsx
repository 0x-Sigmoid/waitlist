import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeDots — Connect the dots before you act",
  description: "NodeDots reads your pull request against the whole repo and shows what it touched, what it missed, and what now conflicts.",
  metadataBase: new URL("https://nodedots-waitlist.sgukobong.chatgpt.site"),
  openGraph: { title: "NodeDots — Connect the dots. Before you ship.", description: "Read your change against the whole repo. NodeDots Code · Early access.", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "NodeDots Code. Connect the dots. Before you ship. Five states for reviewing code changes." }] },
  twitter: { card: "summary_large_image", title: "NodeDots — Connect the dots. Before you ship.", description: "Read your change against the whole repo.", images: ["/og.png"] },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/favicon-16.png", sizes: "16x16", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="preload" href="/fonts/recursive-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('nodedots-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark')})()` }}/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
