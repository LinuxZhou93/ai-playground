'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { toast } from 'sonner';
import { ShieldAlert, CheckCircle2, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    // 获取当前登录用户
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // 尝试从 Supabase 获取
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            id: session.user.id,
          });
        }
      });
    }
    setCheckingUser(false);
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('请输入卡密');
      return;
    }

    if (!user) {
      toast.error('请先登录后再进行核销');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '核销失败');
      }

      toast.success('卡密核销成功！会员已激活');
      
      // 触发本地订阅状态更新
      try {
        const statusRes = await fetch(`/api/subscription/status?userId=${user.id}`);
        const statusData = await statusRes.json();
        localStorage.setItem('fc_subscription_status', JSON.stringify({ 
           status: statusData.isVIP ? 'active' : 'expired', 
           level: statusData.isVIP ? 'professional' : 'free',
           expires_at: statusData.currentPeriodEnd ? new Date(statusData.currentPeriodEnd).getTime() : 0 
        }));
      } catch (e) {
        console.error('Failed to sync local subscription status:', e);
      }

      // 跳转至个人中心/首页
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || '核销失败，请检查卡密是否正确');
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          卡密核销中心
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          输入您的尊享卡密，即刻解锁 FutureClass 科技特长生实训舱
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          {!user ? (
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200/60">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">需要登录</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>您当前处于访客状态，请先登录后再进行卡密核销。</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRedeem}>
              <div>
                <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">
                  当前登录账号
                </label>
                <div className="mt-1">
                  <input
                    id="user-email"
                    type="text"
                    disabled
                    className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-xl shadow-sm bg-slate-50 text-slate-500 sm:text-sm"
                    value={user.email}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="redeem-code" className="block text-sm font-medium text-slate-700">
                  请输入卡密
                </label>
                <div className="mt-1">
                  <input
                    id="redeem-code"
                    name="code"
                    type="text"
                    required
                    placeholder="例如: VIP-30DAYS-XXXXXX"
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '立即核销激活'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}