import IntakeAdminClient from "./intake-admin-client";
import { getTechSpecialistIntakes } from "./actions";

export const revalidate = 0;

export default async function ERPIntakePage() {
  const result = await getTechSpecialistIntakes();
  return <IntakeAdminClient initialRows={result.data} initialError={result.error} />;
}

