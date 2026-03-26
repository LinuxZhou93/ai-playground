import type { Metadata } from 'next';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning translate="no">
      <head>
        <link href="/assets/css/titan-ai-assistant.css" rel="stylesheet" />
        <script src="https://kit.fontawesome.com/b2a7bd117b.js" crossOrigin="anonymous" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s1 = localStorage.getItem('settings-storage');
                var s2 = localStorage.getItem('settings_storage');
                var needsRefresh = false;
                if (s1 && (s1.includes('sk-4nI8bNhmk') || s1.includes('"version":2'))) {
                  localStorage.removeItem('settings-storage');
                  needsRefresh = true;
                }
                if (s2 && (s2.includes('sk-4nI8bNhmk') || s2.includes('"version":2'))) {
                  localStorage.removeItem('settings_storage');
                  needsRefresh = true;
                }
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
        
        {/* 全局悬浮的 Titan A.I. 侧边栏伴读中枢 */}
        <Script src="/assets/js/titan-ai-assistant.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
