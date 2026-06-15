'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import zh from '@/messages/zh.json';
import en from '@/messages/en.json';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

const messages: Record<string, typeof zh> = {
  zh: zh,
  'zh-CN': zh,
  en: en,
  'en-US': en,
};

export default function PricingPage() {
  const params = useParams();
  const localeStr = (params?.locale as string) || 'zh';
  const t = messages[localeStr] || messages['zh'];
  const pricing = t.pricing;

  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            id: session.user.id,
          });
        }
      });
    }

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment_status') === 'success') {
      setPaymentSuccess(true);
      toast.success(localeStr === 'zh' || localeStr === 'zh-CN' ? '订阅购买成功！正在为您配给算力。' : 'Subscription purchased successfully! Allocating compute resources for you.');
    }
  }, [localeStr]);

  const handleCheckout = async (tier: 'monthly' | 'quarterly' | 'yearly') => {
    if (!user) {
      toast.error(localeStr === 'zh' || localeStr === 'zh-CN' ? '请先登录后再进行购买' : 'Please login before making a purchase');
      return;
    }

    setLoadingTier(tier);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '创建支付会话失败');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('未返回支付链接');
      }
    } catch (err: any) {
      toast.error(err.message || '操作失败');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#03050c] text-[#cbd5e1] font-sans overflow-x-hidden relative flex flex-col justify-center py-20 px-6">
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="payment-success-modal">
          <div className="bg-[#0b1329]/80 backdrop-blur-2xl border border-emerald-500/30 rounded-[24px] p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] transform scale-100 transition-all duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-mono font-bold text-white mb-4" data-testid="success-modal-title">
              {localeStr === 'zh' || localeStr === 'zh-CN' ? '订阅支付成功！' : 'Payment Successful!'}
            </h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              {localeStr === 'zh' || localeStr === 'zh-CN' 
                ? '我们已收到您的款项。您的账户订阅将在几秒内通过 Stripe Webhook 自动同步并激活。您也可以前往卡密核销中心手动校验状态。' 
                : 'We have received your payment. Your subscription will be synced and activated via Stripe Webhook in a few seconds. You can also manually check status in the redeem center.'}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                id="success-modal-close-btn"
                onClick={() => {
                  setPaymentSuccess(false);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold rounded-xl transition-all active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                {localeStr === 'zh' || localeStr === 'zh-CN' ? '好的，我知道了' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#1a1b38_0%,#03050c_60%)]">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[120px] animate-pulse duration-[10s]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full z-10 flex flex-col justify-center">
        <header className="text-center mb-16">
          <h1 
            data-testid="pricing-title"
            className="font-mono font-black text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {pricing.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {pricing.subtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative w-full">
          
          <div className="flex flex-col justify-between p-10 bg-[#0f1423]/50 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-3 hover:border-white/15 hover:shadow-[0_40px_80px_rgba(0,240,255,0.05)]">
            <div>
              <h3 className="font-mono text-xl font-bold text-slate-300 tracking-wider mb-2">{pricing.trialTitle}</h3>
              <p className="text-slate-500 text-xs mb-8">{pricing.trialDesc}</p>
              <div className="mb-4">
                <div className="font-mono font-black text-5xl text-white tracking-tight flex items-baseline">
                  <span data-testid="price-currency" className="text-2xl font-medium mr-1 opacity-60">{pricing.currency}</span>
                  <span data-testid="price-value" className="text-5xl">{pricing.priceTrial}</span>
                  <span data-testid="price-period" className="text-sm font-normal text-slate-400 ml-1">{pricing.trialPeriod}</span>
                </div>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed text-[#cbd5e1]">
                {pricing.features.trial.map((feature: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${idx >= 3 ? 'opacity-30' : ''}`}>
                    <svg className={`w-4.5 h-4.5 mr-3 mt-0.5 flex-shrink-0 ${idx >= 3 ? 'text-slate-600' : 'text-cyan-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {idx >= 3 ? (
                        <>
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                        </>
                      ) : (
                        <path d="M20 6L9 17l-5-5" />
                      )}
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-xl font-mono font-bold text-sm tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/30 active:scale-95">
              {pricing.btnTrial}
            </button>
          </div>

          <div className="flex flex-col justify-between p-10 bg-[#0f1423]/50 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-3 hover:border-white/15 hover:shadow-[0_40px_80px_rgba(0,240,255,0.05)]">
            <div>
              <h3 className="font-mono text-xl font-bold text-cyan-400 tracking-wider mb-2">{pricing.monthlyTitle}</h3>
              <p className="text-slate-400 text-xs mb-8">{pricing.monthlyDesc}</p>
              <div className="mb-4">
                <div className="font-mono font-black text-5xl text-white tracking-tight flex items-baseline">
                  <span data-testid="price-currency" className="text-2xl font-medium mr-1 opacity-60">{pricing.currency}</span>
                  <span data-testid="price-value" className="text-5xl">{pricing.priceMonthly}</span>
                  <span data-testid="price-period" className="text-sm font-normal text-slate-400 ml-1">{pricing.monthlyPeriod}</span>
                </div>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed text-[#cbd5e1]">
                {pricing.features.monthly.map((feature: string, idx: number) => (
                  <li key={idx} className={`flex items-start ${idx >= 4 ? 'opacity-30' : ''}`}>
                    <svg className={`w-4.5 h-4.5 mr-3 mt-0.5 flex-shrink-0 ${idx >= 4 ? 'text-slate-600' : 'text-cyan-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {idx >= 4 ? (
                        <>
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                        </>
                      ) : (
                        <path d="M20 6L9 17l-5-5" />
                      )}
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleCheckout('monthly')}
              disabled={loadingTier !== null}
              className="mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-xl font-mono font-bold text-sm tracking-widest text-white transition-all hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-400 active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingTier === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : pricing.btnMonthly}
            </button>
          </div>

          <div className="flex flex-col justify-between p-10 bg-[#0f1423]/70 border border-cyan-500/40 rounded-[24px] shadow-[0_30px_60px_rgba(0,240,255,0.15)] relative overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:border-cyan-400 hover:shadow-[0_50px_100px_rgba(0,240,255,0.25)]">
            <div className="absolute top-[20px] right-[-35px] bg-cyan-400 text-black px-10 py-1.5 font-mono text-[9px] font-black tracking-widest rotate-45 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              {pricing.popular}
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-white tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">{pricing.quarterlyTitle}</h3>
              <p className="text-cyan-200 text-xs mb-8">{pricing.quarterlyDesc}</p>
              <div className="mb-4 flex items-end">
                <div className="font-mono font-black text-5xl text-white tracking-tight flex items-baseline">
                  <span data-testid="price-currency" className="text-2xl font-medium mr-1 opacity-60">{pricing.currency}</span>
                  <span data-testid="price-value" className="text-5xl">{pricing.priceQuarterly}</span>
                  <span data-testid="price-period" className="text-sm font-normal text-slate-400 ml-1">{pricing.quarterlyPeriod}</span>
                </div>
                <div className="line-through text-slate-500 font-mono text-lg ml-3 mb-1">
                  {pricing.currency}{pricing.priceQuarterlyStrike}
                </div>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed text-[#cbd5e1]">
                {pricing.features.quarterly.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-4.5 h-4.5 mr-3 mt-0.5 flex-shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleCheckout('quarterly')}
              disabled={loadingTier !== null}
              className="mt-10 w-full py-4 bg-cyan-400 hover:bg-white text-black rounded-xl font-mono font-bold text-sm tracking-widest shadow-[0_10px_20px_rgba(0,240,255,0.2)] hover:shadow-[0_15px_30px_rgba(0,240,255,0.4)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingTier === 'quarterly' ? <Loader2 className="w-4 h-4 animate-spin" /> : pricing.btnQuarterly}
            </button>
          </div>

          <div className="flex flex-col justify-between p-10 bg-gradient-to-br from-[#141414]/90 to-[#322800]/90 border border-yellow-500/30 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-yellow-500/80 hover:shadow-[0_40px_80px_rgba(255,214,0,0.2)]">
            <div className="absolute top-[20px] right-[-35px] bg-yellow-400 text-black px-10 py-1.5 font-mono text-[9px] font-black tracking-widest rotate-45 shadow-[0_0_20px_rgba(255,214,0,0.5)]">
              {pricing.vip}
            </div>
            <div>
              <h3 className="font-mono text-2xl font-black text-yellow-400 tracking-wider mb-2">{pricing.annualTitle}</h3>
              <p className="text-yellow-200/60 text-xs mb-8">{pricing.annualDesc}</p>
              <div className="mb-4">
                <div className="font-mono font-black text-5xl text-white tracking-tight flex items-baseline">
                  <span data-testid="price-currency" className="text-2xl font-medium mr-1 opacity-60">{pricing.currency}</span>
                  <span data-testid="price-value" className="text-5xl">{pricing.priceAnnual}</span>
                  <span data-testid="price-period" className="text-sm font-normal text-slate-400 ml-1">{pricing.annualPeriod}</span>
                </div>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed text-[#cbd5e1]">
                {pricing.features.annual.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-4.5 h-4.5 mr-3 mt-0.5 flex-shrink-0 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handleCheckout('yearly')}
              disabled={loadingTier !== null}
              className="mt-10 w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black rounded-xl font-mono font-bold text-sm tracking-widest shadow-[0_10px_20px_rgba(255,214,0,0.2)] hover:shadow-[0_15px_30px_rgba(255,214,0,0.4)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingTier === 'yearly' ? <Loader2 className="w-4 h-4 animate-spin" /> : pricing.btnAnnual}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
