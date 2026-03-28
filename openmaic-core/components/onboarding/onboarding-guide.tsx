'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'fc-onboarding-done';

interface Step {
  target: string; // data-onboarding attribute value
  title: string;
  description: string;
  emoji: string;
  position: 'bottom' | 'top';
}

const STEPS: Step[] = [
  {
    target: 'greeting-bar',
    title: '设置你的昵称',
    description: '点击头像和名字，给自己取一个酷炫的专属代号吧！',
    emoji: '👋',
    position: 'bottom',
  },
  {
    target: 'grade-selector',
    title: '选择你的学龄',
    description: '选择匹配的学龄段，AI 会自动调整教学难度和风格~',
    emoji: '🎯',
    position: 'bottom',
  },
  {
    target: 'topic-input',
    title: '输入你想学的课题',
    description: '随便输入一个你感兴趣的话题，或点击上方的快捷卡片一键开始！',
    emoji: '🚀',
    position: 'top',
  },
];

export function OnboardingGuide() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if onboarding should show
  useEffect(() => {
    // Delay to allow page to fully render
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) {
          setActive(true);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Measure target element position
  const measureTarget = useCallback(() => {
    if (!active) return;
    const currentStep = STEPS[step];
    const el = document.querySelector(`[data-onboarding="${currentStep.target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [active, step]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [measureTarget]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setActive(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  if (!active || !rect) return null;

  const currentStep = STEPS[step];
  const padding = 8;
  const spotlightStyle = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {};
  if (currentStep.position === 'bottom') {
    tooltipStyle.top = rect.bottom + 16;
    tooltipStyle.left = Math.max(16, rect.left);
  } else {
    tooltipStyle.bottom = window.innerHeight - rect.top + 16;
    tooltipStyle.left = Math.max(16, rect.left);
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
        >
          {/* Overlay with hole - using box-shadow trick */}
          <div
            className="absolute inset-0"
            style={{
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.45)`,
              ...spotlightStyle,
              borderRadius: '16px',
              position: 'fixed',
            }}
            onClick={handleDismiss}
          />

          {/* Spotlight border glow */}
          <div
            className="fixed rounded-2xl ring-2 ring-violet-400/60 shadow-[0_0_20px_rgba(139,92,246,0.3)] pointer-events-none transition-all duration-500 ease-out"
            style={spotlightStyle}
          />

          {/* Tooltip card */}
          <motion.div
            ref={tooltipRef}
            key={step}
            initial={{ opacity: 0, y: currentStep.position === 'bottom' ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: currentStep.position === 'bottom' ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed w-80 z-[10000]"
            style={tooltipStyle}
          >
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_-4px_rgba(0,0,0,0.15)] border border-white/60 dark:border-slate-700/60 p-4">
              {/* Arrow */}
              {currentStep.position === 'bottom' && (
                <div className="absolute -top-2 left-8 w-4 h-4 bg-white/95 dark:bg-slate-800/95 border-l border-t border-white/60 dark:border-slate-700/60 rotate-45" />
              )}
              {currentStep.position === 'top' && (
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/95 dark:bg-slate-800/95 border-r border-b border-white/60 dark:border-slate-700/60 rotate-45" />
              )}

              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-violet-500" />
                  <span className="text-[11px] font-semibold text-violet-500">
                    新手引导 {step + 1}/{STEPS.length}
                  </span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="size-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl shrink-0 mt-0.5">{currentStep.emoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{currentStep.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{currentStep.description}</p>
                </div>
              </div>

              {/* Progress dots + actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? 'w-4 bg-gradient-to-r from-violet-500 to-fuchsia-500'
                          : i < step
                            ? 'w-1.5 bg-violet-300'
                            : 'w-1.5 bg-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDismiss}
                    className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1"
                  >
                    跳过
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-fuchsia-500/25 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    {step < STEPS.length - 1 ? (
                      <>
                        下一步
                        <ChevronRight className="size-3" />
                      </>
                    ) : (
                      '开始学习！'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
