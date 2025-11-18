import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ScrollProgress from "@/components/ui/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OISHINE! - Mochi, Dorayaki, Onigiri, Gyoza & Minuman (おいしいね！)",
  description: "Nikmati kelezatan Mochi, Dorayaki, Onigiri, Gyoza, Iced Matcha Latte, dan Yuzu Tea di OISHINE! (おいしいね！) - Masakan Jepang autentik dengan harga terjangkau.",
  keywords: ["OISHINE", "おいしいね！", "Mochi", "Dorayaki", "Onigiri", "Gyoza", "Matcha", "Yuzu", "makanan Jepang", "minuman Jepang", "enak sekali", "QRIS", "payment", "e-wallet"],
  authors: [{ name: "OISHINE! Team" }],
  openGraph: {
    title: "OISHINE! - Mochi, Dorayaki, Onigiri, Gyoza & Minuman (おいしいね！)",
    description: "Nikmati kelezatan Mochi, Dorayaki, Onigiri, Gyoza, Iced Matcha Latte, dan Yuzu Tea di OISHINE! (おいしいね！)",
    url: "https://oishine.com",
    siteName: "OISHINE!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OISHINE! - Mochi, Dorayaki, Onigiri, Gyoza & Minuman (おいしいね！)",
    description: "Nikmati kelezatan Mochi, Dorayaki, Onigiri, Gyoza, Iced Matcha Latte, dan Yuzu Tea di OISHINE! (おいしいね！)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ScrollProgress />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
