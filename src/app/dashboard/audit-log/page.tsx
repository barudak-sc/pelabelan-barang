import { requireAdmin } from "@/lib/auth-guard";
import { getAuditLogs } from "@/actions/audit-logs";
import { AuditLogClient } from "./audit-log-client";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const logs = await getAuditLogs({
    entityType: params.entityType,
    action: params.action,
  });

  return <AuditLogClient logs={JSON.parse(JSON.stringify(logs))} filters={params} />;
}
