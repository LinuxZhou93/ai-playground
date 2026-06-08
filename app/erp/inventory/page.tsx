import { loadInventoryPageData } from "../actions";
import InventoryClient from "./inventory-client";

export const revalidate = 0;

export default async function ERPInventory() {
  const inventoryData = await loadInventoryPageData();

  return <InventoryClient initialData={inventoryData} />;
}
