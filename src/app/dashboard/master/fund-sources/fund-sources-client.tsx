"use client";

import { useState } from "react";
import type { FundSource } from "@generated/prisma/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FundSourceFormDialog } from "./fund-source-form-dialog";
import { getColumns } from "./columns";
import {
  createFundSource,
  updateFundSource,
  deleteFundSource,
} from "@/actions/fund-sources";
import type { FundSourceFormData } from "@/lib/validations/master-data";

type FundSourceWithCount = FundSource & { _count: { assets: number } };

type FundSourcesClientProps = {
  fundSources: FundSourceWithCount[];
};

export function FundSourcesClient({ fundSources }: FundSourcesClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FundSourceWithCount | null>(null);

  function handleEdit(fs: FundSourceWithCount) {
    setSelected(fs);
    setFormOpen(true);
  }

  function handleDelete(fs: FundSourceWithCount) {
    setSelected(fs);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: FundSourceFormData) {
    const result = selected
      ? await updateFundSource(selected.id, data)
      : await createFundSource(data);

    if (result.success) {
      toast.success(selected ? "Sumber dana berhasil diperbarui" : "Sumber dana berhasil ditambahkan");
      setFormOpen(false);
      setSelected(null);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteConfirm() {
    if (!selected) return;
    const result = await deleteFundSource(selected.id);
    if (result.success) {
      toast.success("Sumber dana berhasil dihapus");
      setDeleteOpen(false);
      setSelected(null);
    } else {
      toast.error(result.error);
    }
  }

  const columns = getColumns(handleEdit, handleDelete);

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Sumber Dana
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={fundSources}
        searchKey="name"
        searchPlaceholder="Cari sumber dana..."
      />
      <FundSourceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        onSubmit={handleFormSubmit}
        fundSource={selected}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
        title="Hapus Sumber Dana"
        description={`Apakah Anda yakin ingin menghapus sumber dana "${selected?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
