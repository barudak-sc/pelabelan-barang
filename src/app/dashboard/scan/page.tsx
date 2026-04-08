import { requireAdmin } from "@/lib/auth-guard";
import { ScannerClient } from "./scanner-client";

export default async function ScanPage() {
  await requireAdmin();
  return <ScannerClient />;
}
