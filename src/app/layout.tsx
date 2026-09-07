import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kredi Hesaplama | Faiz ve Ödeme Planı",
  description:
    "Kredi tutarı, vade ve faiz oranını girerek aylık taksitinizi, toplam maliyetinizi ve ayrıntılı ödeme planınızı hesaplayın.",
  applicationName: "Kredi Hesaplama",
  keywords: [
    "kredi hesaplama",
    "ihtiyaç kredisi",
    "konut kredisi",
    "taşıt kredisi",
    "ödeme planı",
    "faiz hesaplama",
  ],
  authors: [{ name: "Kredi Hesaplama" }],
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${ibmPlexSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
