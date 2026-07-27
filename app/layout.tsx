import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "animate.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/lib/hooks/use-theme";
import { I18nProvider } from "@/lib/hooks/use-i18n";
import { Toaster } from "@/components/ui/sonner";
import { ServerProvidersInit } from "@/components/server-providers-init";
import { LegacyAssistantLoader } from "@/components/legacy-assistant-loader";

const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FutureClass | TitanTech 科技特长生实训舱",
  description:
    "L4 Multi-Agent Educational Engine powered by Titan Tech. 专门为科技特长生打造的专属 AI 实境全息课室。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
      translate="no"
    >
      <head>
        <link href="/assets/css/titan-ai-assistant.css" rel="stylesheet" />
        <link href="/assets/tcm/all.min.css" rel="stylesheet" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
        data-bolt-no-translate="true"
        translate="no"
      >
        <ThemeProvider>
          <I18nProvider>
            <ServerProvidersInit />
            {children}
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>

        <LegacyAssistantLoader />
      </body>
    </html>
  );
}
