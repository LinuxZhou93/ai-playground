import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '君子之境 | 数字化修身系统',
  description: '主敬、静坐、早起、谨言。君子之境数字化修身系统。',
};

export default function GentlemanRealmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;600;900&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
      {children}
    </>
  );
}
