import { requireAdmin } from "@/lib/auth-guard";
import { ImportClient } from "./import-client";

export default async function ImportPage() {
  await requireAdmin();
  return <ImportClient />;
}
