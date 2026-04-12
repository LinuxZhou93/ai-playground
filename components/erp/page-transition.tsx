"use client";

import { motion, HTMLMotionProps } from "motion/react";
import React from "react";

/**
 * 页面级过渡动画容器
 * V3 性能优化：去除 filter:blur 入场动画（GPU 重绘成本极高），
 * 改用纯 opacity + translateY 实现丝滑过渡。
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="will-change-[transform,opacity] w-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * 列表项交错入场动画容器
 */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.02,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 单个交错子元素动画
 * V3 性能优化：
 * - 移除 backdrop-blur-xl（GPU 杀手）
 * - 移除 filter:blur 入场动画
 * - 移除 whileHover scale（避免 layout thrash）
 * - 保留纯 CSS hover shadow 过渡（GPU 合成层友好）
 */
export function StaggerItem({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
