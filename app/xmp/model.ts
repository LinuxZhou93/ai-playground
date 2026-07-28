import type { LucideIcon } from "lucide-react";

export type XmpRole = "operator" | "research" | "teacher" | "family";

export type XmpModuleId =
  | "overview"
  | "curriculum"
  | "scheduling"
  | "teaching"
  | "classroom"
  | "companion"
  | "growth"
  | "family"
  | "fleet"
  | "operations"
  | "access"
  | "governance";

export type XmpModule = {
  id: XmpModuleId;
  name: string;
  englishName: string;
  description: string;
  href: string;
  icon: LucideIcon;
  roles: XmpRole[];
  phase: number;
};

export type XmpDemoTenant = {
  id: string;
  name: string;
  campus: string;
  environment: "local-demo";
  children: number;
  classes: number;
  teachers: number;
};
