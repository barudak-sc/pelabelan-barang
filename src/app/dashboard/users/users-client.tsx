"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getColumns, type UserRow } from "./columns";
import { UserFormDialog } from "./user-form-dialog";
import { deleteUser } from "@/actions/users";

export function UsersClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const columns = getColumns(
    (user) => { setEditData(user); setFormOpen(true); },
    (user) => setDeleteTarget(user)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} pengguna terdaftar
          </p>
        </div>
        <Button onClick={() => { setEditData(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Cari pengguna..." />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editData={editData}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Pengguna"
        description={`Pengguna "${deleteTarget?.name}" akan dihapus.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const result = await deleteUser(deleteTarget.id);
          if (result.success) {
            toast.success("Pengguna berhasil dihapus");
            setDeleteTarget(null);
            router.refresh();
          } else {
            toast.error(result.error);
          }
        }}
      />
    </div>
  );
}
