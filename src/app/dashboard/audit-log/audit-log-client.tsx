"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AuditLogRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  createdAt: string;
  user: { name: string; username: string };
};

function actionBadge(action: string) {
  switch (action) {
    case "CREATE": return <Badge className="bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400">CREATE</Badge>;
    case "UPDATE": return <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">UPDATE</Badge>;
    case "DELETE": return <Badge className="bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400">DELETE</Badge>;
    case "RESTORE": return <Badge className="bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400">RESTORE</Badge>;
    default: return <Badge variant="secondary">{action}</Badge>;
  }
}

export function AuditLogClient({
  logs,
  filters,
}: {
  logs: AuditLogRow[];
  filters: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v && k !== key) params.set(k, v);
    }
    if (value && value !== "all") params.set(key, value);
    router.push(`/dashboard/audit-log?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Audit Log</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Riwayat semua perubahan data — tidak bisa diedit atau dihapus
        </p>
      </div>

      <div className="flex gap-3">
        <Select
          value={filters.entityType ?? "all"}
          onValueChange={(v) => updateFilter("entityType", v ?? "")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Entitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Entitas</SelectItem>
            <SelectItem value="asset">Aset</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.action ?? "all"}
          onValueChange={(v) => updateFilter("action", v ?? "")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="RESTORE">Restore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark shadow-theme-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Waktu</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-400">
                  Tidak ada log
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <>
                  <TableRow
                    key={log.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <TableCell>
                      {log.changes ? (
                        expandedId === log.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-sm">{log.user.name}</TableCell>
                    <TableCell>{actionBadge(log.action)}</TableCell>
                    <TableCell className="text-sm capitalize">{log.entityType}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">
                      {log.entityId.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                  {expandedId === log.id && log.changes && (
                    <TableRow key={`${log.id}-detail`}>
                      <TableCell colSpan={6} className="bg-gray-50 dark:bg-gray-800/50 p-4">
                        <div className="space-y-1 text-xs font-mono">
                          {Object.entries(log.changes as Record<string, { old: unknown; new: unknown }>).map(([field, change]) => (
                            <div key={field} className="flex gap-2">
                              <span className="font-semibold text-gray-600 dark:text-gray-300 min-w-[120px]">{field}:</span>
                              <span className="text-error-500 line-through">{String(change.old ?? "null")}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-success-500">{String(change.new ?? "null")}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
