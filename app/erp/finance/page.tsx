import { loadFinancePageData, getLedgerLogs } from "../actions";
import FinanceClient from "./finance-client";

export const revalidate = 0;

export default async function ERPFinance() {
  const [financeData, ledgers] = await Promise.all([
    loadFinancePageData(),
    getLedgerLogs(100)
  ]);

  return <FinanceClient initialData={{ ...financeData, ledgers }} />;
}
