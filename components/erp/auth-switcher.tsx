"use client";

import React, { useState, useEffect } from "react";
import { setAuthCookies, getAuthCookies } from "@/app/erp/auth-actions";
import { Shield, MapPin, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ROLES = [
  { id: "ADMIN", label: "超级管理员 (全限)" },
  { id: "ACADEMIC", label: "教务主管" },
  { id: "SALES", label: "销售顾问" },
];

const CAMPUSES = [
  { id: "ALL", label: "所有校区 (总部视图)" },
  { id: "高新校区", label: "天府四街直营校" },
  { id: "太古里校区", label: "太古里研学中心" },
];

export function DevAuthSwitcher() {
  const [role, setRole] = useState("ADMIN");
  const [campus, setCampus] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 初始加载时读取 cookie state
    getAuthCookies().then((data) => {
      if (data.role) setRole(data.role);
      // fallback uuid matching or just string matching for MVP
      if (data.campus_id) setCampus(data.campus_name || "ALL");
    });
  }, []);

  const handleSwitch = async (newRole: string, newCampus: string) => {
    setLoading(true);
    setRole(newRole);
    setCampus(newCampus);
    
    // In actual implementation, newCampus would be a UUID fetched from DB.
    // For MVP frontend mock, we map the name directly to a known ID or pass the name as ID to filter.
    const campusIdMap: Record<string, string> = {
       "ALL": "",
       "高新校区": "camp-1", 
       "太古里校区": "camp-2"
    };

    try {
      await setAuthCookies(newRole, newCampus, campusIdMap[newCampus] || "");
      toast.success(`身份已切换：${ROLES.find(r => r.id === newRole)?.label}`, {
        description: `当前数据沙盒：${newCampus}`
      });
      window.location.reload(); // Force full reload to update server components layout
    } catch (e) {
      toast.error("切换失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full border border-indigo-500/20 backdrop-blur-md">
      <Shield className="w-3.5 h-3.5 text-indigo-500" />
      <select 
        className="bg-transparent text-[11px] font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer appearance-none"
        value={role}
        onChange={(e) => handleSwitch(e.target.value, campus)}
        disabled={loading}
      >
        {ROLES.map(r => <option key={r.id} value={r.id} className="text-black dark:text-zinc-800">{r.label}</option>)}
      </select>
      
      <div className="w-[1px] h-3 bg-indigo-500/20"></div>
      
      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
      <select 
        className="bg-transparent text-[11px] font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer appearance-none max-w-[100px] truncate"
        value={campus}
        onChange={(e) => handleSwitch(role, e.target.value)}
        disabled={loading || role === 'ADMIN'}
      >
        {CAMPUSES.map(c => <option key={c.id} value={c.id} className="text-black dark:text-zinc-800">{c.label}</option>)}
      </select>

      {loading && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
    </div>
  );
}
