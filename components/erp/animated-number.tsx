"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, animate, useSpring, useTransform } from "motion/react";

/**
 * AnimatedNumber - 极客级 SaaS ERP 数字展示组件
 * 
 * 采用 Linear/Stripe 视觉风格，集成了：
 * 1. Tabular Numbers (等宽字体) 防止抖动
 * 2. 玻璃拟物化 (Glassmorphism) 容器表现
 * 3. 渐进式入场动画与物理弹簧感
 * 4. 针对财务数据的排版优化
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className = "",
  formatOptions,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  // 使用 Framer Motion 的 animate 函数处理数值流
  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      // 使用更高级的指数型缓动曲线 (Quintic Out)
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  // 格式化逻辑保持不变，但确保 displayValue 取整或按需处理
  const formatted = formatOptions
    ? new Intl.NumberFormat("zh-CN", formatOptions).format(Math.round(displayValue))
    : Math.round(displayValue).toLocaleString();

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`
        relative inline-flex items-baseline font-medium
        tracking-tighter text-slate-900 dark:text-slate-50
        ${className}
      `}
    >
      {/* 前缀样式优化：略微缩小并降低透明度，增强层次感 */}
      {prefix && (
        <span className="mr-0.5 self-center text-[0.6em] font-semibold opacity-60 select-none">
          {prefix}
        </span>
      )}

      {/* 主数字：强制使用等宽数字，避免数值变动时的横向抖动 */}
      <span className="tabular-nums tracking-tight">
        {formatted}
      </span>

      {/* 后缀样式优化 */}
      {suffix && (
        <span className="ml-0.5 self-center text-[0.5em] font-bold opacity-50 select-none">
          {suffix}
        </span>
      )}

      {/* 极简玻璃拟物化装饰底层 (仅在 Hover 时通过父级或自身触发感官提升) */}
      <motion.span
        className="absolute -inset-x-2 -inset-y-1 -z-10 rounded-lg bg-slate-400/0 transition-colors duration-500 group-hover:bg-slate-400/5 dark:group-hover:bg-white/5"
        aria-hidden="true"
      />
    </motion.span>
  );
}

/**
 * 进阶用法示例：KPI 卡片包装器
 * 展示如何配合 AnimatedNumber 达到 Linear 风格效果
 */
export function KPICard({ title, value, unit, trend }: { title: string, value: number, unit?: string, trend?: number }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="flex items-end gap-2">
          <AnimatedNumber 
            value={value} 
            className="text-3xl sm:text-4xl" 
            suffix={unit}
          />
          {trend !== undefined && (
            <span className={`mb-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      
      {/* 装饰性背景光晕 */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-100/50 blur-3xl transition-colors group-hover:bg-indigo-500/10 dark:bg-slate-800/50" />
    </motion.div>
  );
}
