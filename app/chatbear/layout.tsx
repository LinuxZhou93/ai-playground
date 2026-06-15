import React from 'react';
import { Inter, Outfit } from 'next/font/google';
import './chatbear.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export default function ChatBearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${outfit.variable} font-sans text-gray-900 antialiased bg-white`}>
      {children}
    </div>
  );
}
