"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { parentLogin } from "../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Fingerprint, Activity, Phone } from "lucide-react";
import { motion } from "motion/react";

export default function ParentLoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await parentLogin(phone);
      if (res.success) {
        toast.success(`掌上校园欢迎您！检测到 ${res.count} 位宝贝`);
        router.push("/parent/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "登录校验失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen min-h-[600px] px-8 justify-center relative overflow-hidden">
      {/* 极简背景特效 */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-40 -left-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative z-10 space-y-12"
      >
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] flex items-center justify-center mx-auto shadow-xl shadow-zinc-200/50 dark:shadow-none mb-8 relative">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[24px] animate-pulse" />
            <Activity className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">FutureClass</h1>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">Parent Portal 家长空间</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-2">Registered Phone 预留手机号</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                type="tel"
                placeholder="请输入教务系统登记的手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl text-base font-black tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                required
                maxLength={11}
              />
            </div>
            <p className="text-[10px] items-center text-center text-zinc-400 pt-2 font-medium">
              *内部测试阶段直接输入预留手机号签发令牌，暂闭短信网关
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-zinc-200 dark:shadow-none transition-all active:scale-95 group"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                身份认证登录
              </span>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
