import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colorado Law Lookup | Search Colorado Revised Statutes - Free Legal Search Tool",
  description: "Search Colorado laws and statutes in plain English. Free AI-powered tool to find answers about Colorado criminal law, property law, traffic violations, family law, and more. Search the Colorado Revised Statutes instantly.",
  keywords: [
    "Colorado law",
    "Colorado statutes",
    "Colorado Revised Statutes",
    "Colorado legal search",
    "Colorado law lookup",
    "Colorado criminal law",
    "Colorado DUI laws",
    "Colorado traffic laws",
    "Colorado property law",
    "Colorado family law",
    "Colorado landlord tenant law",
    "Colorado employment law",
    "Colorado marijuana laws",
    "Colorado water rights",
    "search Colorado laws",
    "Colorado legal questions",
    "Colorado statute search",
    "CRS search",
    "Colorado legal help",
    "Colorado law database"
  ],
  authors: [{ name: "Colorado Law Lookup" }],
  creator: "Colorado Law Lookup",
  publisher: "Colorado Law Lookup",
  
  // Favicon and icons
  icons: {
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Flag_of_Colorado.svg/960px-Flag_of_Colorado.svg.png",
    apple: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Flag_of_Colorado.svg/960px-Flag_of_Colorado.svg.png",
  },
  
  // Theme color
  themeColor: "#002868",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com", // Replace with your actual domain
    siteName: "Colorado Law Lookup",
    title: "Colorado Law Lookup - Search Colorado Statutes in Plain English",
    description: "Free AI-powered search tool for Colorado laws. Find answers to legal questions about criminal law, property, traffic, family law, and more from the Colorado Revised Statutes.",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Flag_of_Colorado.svg/960px-Flag_of_Colorado.svg.png",
        width: 960,
        height: 640,
        alt: "Colorado Law Lookup - Colorado Flag",
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Colorado Law Lookup - Search Colorado Laws",
    description: "Free AI-powered tool to search Colorado Revised Statutes in plain English. Get instant answers to your Colorado legal questions.",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Flag_of_Colorado.svg/960px-Flag_of_Colorado.svg.png"],
  },
  
  // Verification and ownership
  verification: {
    // Add your verification codes here when you set them up:
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // App-specific metadata
  applicationName: "Colorado Law Lookup",
  category: "Legal",
  
  // Additional metadata
  other: {
    "geo.region": "US-CO",
    "geo.placename": "Colorado",
    "format-detection": "telephone=no",
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://yourdomain.com", // Replace with your actual domain
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Colorado Law Lookup",
  "description": "Search Colorado Revised Statutes in plain English using AI-powered semantic search",
  "url": "https://yourdomain.com",
  "applicationCategory": "Legal",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1"
  },
  "areaServed": {
    "@type": "State",
    "name": "Colorado"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* JSON-LD Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}