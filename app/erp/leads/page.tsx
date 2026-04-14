import { getLeads } from "../actions";
import LeadsClient from "./leads-client";

export const revalidate = 0;

export default async function ERPLeadsPage() {
  const initialLeads = await getLeads();

  return <LeadsClient initialLeads={initialLeads} />;
}
