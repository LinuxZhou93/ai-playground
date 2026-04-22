"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * 全局搜索组件
 * 输入回车后跳转到学员管理页并带上搜索词
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      router.push(`/futureclass/students?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }, [query, router]);

  return (
    <div className="relative w-full max-w-sm group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-emerald-500" />
      <Input
        ref={inputRef}
        placeholder="搜索学员姓名、手机号..."
        className="pl-10 pr-10 bg-muted/30 border-none focus-visible:ring-emerald-500 transition-all duration-300 focus-visible:bg-card focus-visible:shadow-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      {query && (
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
