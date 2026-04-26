"use client";

import React, { useState, useEffect } from "react";
import { getStaffList, getCampusesList, addStaffMember, toggleStaffStatus } from "../actions";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  ShieldAlert, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/erp/skeleton-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function StaffManagementPanel() {
  const [staff, setStaff] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "ACADEMIC",
    campus_id: ""
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [_staff, _campuses] = await Promise.all([
        getStaffList(),
        getCampusesList()
      ]);
      setStaff(_staff);
      setCampuses(_campuses);
    } catch (e: any) {
      toast.error("初始化数据失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStaff = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("资料不完整");
      return;
    }
    setSubmitting(true);
    try {
      await addStaffMember({ ...formData, campus_id: formData.campus_id || null });
      toast.success("教职员工入档成功");
      setOpenAdd(false);
      setFormData({ name: "", phone: "", role: "ACADEMIC", campus_id: "" });
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    try {
      await toggleStaffStatus(id, currentStatus);
      toast.success("权限状态已更新");
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <SkeletonTable />;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">组织架构花名册</h3>
          <p className="text-xs text-slate-500">仅 ADMIN 可分配操作人员系统角色 (Role)。</p>
        </div>
        
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold shadow-md shadow-indigo-500/20">
              <Plus className="h-4 w-4" /> 录入员工
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[24px]">
            <DialogHeader>
              <DialogTitle>新建教职档案</DialogTitle>
              <DialogDescription>为新入职人员建立底层权限节点。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold">员工姓名</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold">联络手机号</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold">职级 Role</label>
                <select 
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="ACADEMIC">教务/主教 (ACADEMIC)</option>
                  <option value="TEACHER">授课教师 (TEACHER)</option>
                  <option value="SALES">招生/销售顾问 (SALES)</option>
                  <option value="ADMIN">超级管理体系 (ADMIN)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold">绑属校区 (可选)</label>
                <select 
                  className="h-10 px-3 rounded-xl border border-slate-200 text-sm outline-none"
                  value={formData.campus_id}
                  onChange={e => setFormData({...formData, campus_id: e.target.value})}
                >
                  <option value="">-- 全国总部不孤立边界 --</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpenAdd(false)}>取消</Button>
              <Button onClick={handleAddStaff} disabled={submitting}>授权确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-4">教职人员</th>
              <th className="px-6 py-4">架构界限 (Campus)</th>
              <th className="px-6 py-4">系派角色 (Role)</th>
              <th className="px-6 py-4">系统许可</th>
              <th className="px-6 py-4 text-right">操盘</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {staff.map((s) => (
               <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                     {s.name.charAt(0)}
                   </div>
                   <div>
                     <p>{s.name}</p>
                     <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3"/> {s.phone}</p>
                   </div>
                 </td>
                 <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                   {s.erp_campuses?.name ? (
                     <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 w-fit">
                       <Building2 className="h-3.5 w-3.5 text-slate-400" />
                       {s.erp_campuses.name}
                     </span>
                   ) : (
                     <span className="text-slate-400 italic font-normal">全平台通行权限</span>
                   )}
                 </td>
                 <td className="px-6 py-4">
                   <Badge variant="secondary" className={`
                     text-[10px] uppercase font-black px-2
                     ${s.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 
                       s.role === 'SALES' ? 'bg-amber-100 text-amber-700' : 
                       'bg-indigo-100 text-indigo-700'}
                   `}>
                     {s.role}
                   </Badge>
                 </td>
                 <td className="px-6 py-4">
                   {s.status === 'ACTIVE' 
                     ? <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><UserCheck className="h-4 w-4"/> 激活态</span>
                     : <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xs"><UserX className="h-4 w-4"/> 已冻结</span>
                   }
                 </td>
                 <td className="px-6 py-4 text-right">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="h-8 rounded-lg text-xs font-semibold"
                     onClick={() => handleToggle(s.id, s.status)}
                   >
                     {s.status === 'ACTIVE' ? '吊销执照' : '重获权限'}
                   </Button>
                 </td>
               </tr>
             ))}
             {staff.length === 0 && (
               <tr><td colSpan={5} className="text-center py-10 text-slate-400"><ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />无任何组织人员档案</td></tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
