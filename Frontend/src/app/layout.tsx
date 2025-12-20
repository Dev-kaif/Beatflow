import { Providers } from "@/components/providers";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Beatflow | AI Song Generator & Text to Music Creator",
  description: "Create full songs and professional beats from text with Beatflow's AI. The ultimate AI music generator for high-quality, royalty-free tracks in any genre. Start for free.",
  keywords: [
    "AI song generator", 
    "text to music AI", 
    "AI beat maker", 
    "generative music", 
    "AI vocal generator", 
    "royalty free AI music", 
    "create songs with AI"
  ],
  authors: [{ name: "Mohammad Kaif" }],
  openGraph: {
    title: "Beatflow | Professional AI Song & Music Generation",
    description: "Turn your ideas into music instantly. Use our AI song generator to create unique tracks, loops, and beats from a simple text prompt.",
    url: "https://beatflow.art",
    siteName: "Beatflow AI",
    images: [
      {
        url: "/beatflow.png",
        width: 1200,
        height: 630,
        alt: "Beatflow AI Music Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beatflow - The World's Most Intuitive AI Song Generator",
    description: "Generate studio-quality music and beats from text. Perfect for content creators and producers.",
    images: ["/beatflow.png"],
  },
  alternates: {
    canonical: "https://beatflow.art",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-background flex min-h-svh flex-col antialiased">
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
