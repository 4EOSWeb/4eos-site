import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Geist_Mono } from "next/font/google";
import { Beacon } from "@/components/analytics/Beacon";
import { site } from "@/lib/site";
import "./globals.css";

/* Archivo carries a width axis, so one family covers the condensed display
   setting and the card titles. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Managed IT, Cybersecurity and IT Strategy in Fort Wayne | 4EOS",
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: {
    icon: "/brand/4eos-icon.svg",
    apple: "/brand/4eos-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d11",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link btn btn-primary">
          Skip to content
        </a>
        <Beacon />
        {children}
      </body>
    </html>
  );
}
