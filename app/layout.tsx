import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import BootOverlay from "./components/BootOverlay";
import StarsBackground from "./components/StarsBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siddharth's Portfolio",
  description:
    "Portfolio of Siddharth Singh — Computer Science & Data Science student at the University of Hong Kong.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Runs before paint so the saved theme is applied with no flash.
  // Defaults to dark when nothing is stored.
  const themeInit = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark', t? t==='dark' : true);}catch(e){document.documentElement.classList.add('dark');}})();`;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-fg">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <StarsBackground />
        <BootOverlay />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
