import { loadDashboardData } from "../actions";
import DashboardClient from "./dashboard-client";

export const revalidate = 0; // Dynamic rendering at runtime to guarantee fresh row-level security

export default async function ERPDashboard() {
  // SSR Direct Fetch - Eliminates Client Waterfall Latency
  const dashData = await loadDashboardData();

  return (
    <DashboardClient initialData={dashData} />
  );
}
