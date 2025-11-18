import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ScrollProgress from "@/components/ui/scroll-progress";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { generateMetadata, generateRestaurantStructuredData, generateLocalBusinessStructuredData } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateMetadata({
  title: "OISHINE! - Mochi, Dorayaki, Onigiri, Gyoza & Minuman (おいしいね！)",
  description: "Nikmati kelezatan Mochi, Dorayaki, Onigiri, Gyoza, Iced Matcha Latte, dan Yuzu Tea di OISHINE! (おいしいね！) - Masakan Jepang autentik dengan harga terjangkau. Pesan sekarang!",
  image: "/oishine-logo-optimized.png",
  url: "https://oishine.com",
  type: "website",
  keywords: ["Mochi", "Dorayaki", "Onigiri", "Gyoza", "Matcha", "Yuzu", "QRIS", "payment", "e-wallet", "delivery", "takeaway"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const restaurantData = generateRestaurantStructuredData();
  const localBusinessData = generateLocalBusinessStructuredData();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OISHINE!" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WebVitalsReporter />
          <ScrollProgress />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
