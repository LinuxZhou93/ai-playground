'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Sun, Moon, Monitor, Palette, Trash2, Shield, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useTheme } from '@/lib/hooks/use-theme';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * UserSettingsDialog — 面向普通用户的简化版设置面板
 * 
 * 只暴露用户关心的设置项：
 * - 外观主题（深色/浅色/跟随系统）
 * - 语言切换
 * - 清除缓存
 * 
 * 技术配置（API Key、Base URL、模型管理等）被完全隐藏，
 * 管理员可通过 Ctrl+Shift+S 直接打开完整的管理面板。
 */

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettingsDialog({ open, onOpenChange }: UserSettingsDialogProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');

  const themes = [
    { id: 'light' as const, icon: Sun, label: t('settings.themeOptions.light'), color: 'from-amber-400 to-orange-400' },
    { id: 'dark' as const, icon: Moon, label: t('settings.themeOptions.dark'), color: 'from-indigo-500 to-purple-600' },
    { id: 'system' as const, icon: Monitor, label: t('settings.themeOptions.system'), color: 'from-slate-400 to-slate-500' },
  ];

  const languages = [
    { id: 'zh-CN' as const, label: '简体中文', flag: '🇨🇳' },
    { id: 'en-US' as const, label: 'English', flag: '🇺🇸' },
  ];

  const handleClearCache = () => {
    if (clearInput !== t('settings.clearCacheConfirmPhrase')) return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      setClearInput('');
      setShowClearConfirm(false);
      onOpenChange(false);
      window.location.reload();
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <DialogTitle className="sr-only">偏好设置</DialogTitle>
          <DialogDescription className="sr-only">配置外观和语言偏好</DialogDescription>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold">偏好设置</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* ── 外观主题 ── */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Sun className="w-3.5 h-3.5" />
                外观主题
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {themes.map(({ id, icon: Icon, label, color }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      theme === id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/70 hover:border-muted'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md', color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                    {theme === id && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 界面语言 ── */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                🌐 界面语言
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {languages.map(({ id, label, flag }) => (
                  <button
                    key={id}
                    onClick={() => setLocale(id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                      locale === id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/70 hover:border-muted'
                    )}
                  >
                    <span className="text-xl">{flag}</span>
                    <span className="text-sm font-medium">{label}</span>
                    {locale === id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 数据管理 ── */}
            <div className="pt-2 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                数据管理
              </h3>
              <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/5 hover:bg-destructive/10 border border-destructive/10 hover:border-destructive/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-destructive">{t('settings.clearCache')}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">清除课堂记录、对话历史和本地缓存</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-destructive/60 transition-colors" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              FutureClass · Titan Tech 
            </span>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 清除缓存确认对话框 */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.clearCacheConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.clearCacheConfirmDescription')}
              <br />
              <span className="text-xs mt-2 block">{t('settings.clearCacheConfirmInput')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            value={clearInput}
            onChange={(e) => setClearInput(e.target.value)}
            placeholder={t('settings.clearCacheConfirmPhrase')}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearInput('')}>
              {t('settings.cancelEdit')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={clearInput !== t('settings.clearCacheConfirmPhrase')}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('settings.clearCacheButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
