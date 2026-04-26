import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import 'animate.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { Toaster } from '@/components/ui/sonner';
import { ServerProvidersInit } from '@/components/server-providers-init';

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'FutureClass | TitanTech 科技特长生实训舱',
  description:
    'L4 Multi-Agent Educational Engine powered by Titan Tech. 专门为科技特长生打造的专属 AI 实境全息课室。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning translate="no">
      <head>
        <link href="/assets/css/titan-ai-assistant.css" rel="stylesheet" />
        <link href="/assets/tcm/all.min.css" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // 强制清除旧的设置缓存，确保硬编码凭证生效
                const keys = ['settings-storage', 'settings_storage'];
                let needsRefresh = false;
                keys.forEach(k => {
                  if (localStorage.getItem(k) !== null) {
                    localStorage.removeItem(k);
                    needsRefresh = true;
                  }
                });
                if (needsRefresh) {
                  window.location.reload();
                }
              } catch (e) {}
            `,
          }}
        />
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
        
        {/* 全局悬浮的 Titan A.I. 侧边栏伴读中枢 (强制开启时间戳以消除强缓存) */}
        <Script src={`/assets/js/titan-ai-assistant.js?v=${Date.now()}`} strategy="lazyOnload" />
      </body>
    </html>
  );
}
