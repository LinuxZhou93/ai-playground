"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

/**
 * V3 全局顶部加载进度条
 * 路由切换时自动显示，类似 YouTube/Linear 的顶部进度指示器
 */
export function TopLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);
    
    const t1 = setTimeout(() => setProgress(60), 100);
    const t2 = setTimeout(() => setProgress(85), 300);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] h-[2.5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.1, duration: 0.3 } }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
