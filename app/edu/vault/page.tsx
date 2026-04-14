import React from "react";
import VaultClient from "./vault-client";
import { getEduAssets } from "./actions";

// Force dynamic since we upload data and want fresh vault lists
export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const assets = await getEduAssets();
  return <VaultClient initialAssets={assets} />;
}
