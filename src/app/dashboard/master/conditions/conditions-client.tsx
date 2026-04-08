"use client";

import { useState } from "react";
import type { Condition } from "@generated/prisma/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ConditionFormDialog } from "./condition-form-dialog";
import { getColumns } from "./columns";
import {
  createCondition,
  updateCondition,
  deleteCondition,
} from "@/actions/conditions";
import type { ConditionFormData } from "@/lib/validations/master-data";

type ConditionWithCount = Condition & { _count: { assets: number } };

type ConditionsClientProps = {
  conditions: ConditionWithCount[];
};

export function ConditionsClient({ conditions }: ConditionsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ConditionWithCount | null>(null);

  function handleEdit(condition: ConditionWithCount) {
    setSelected(condition);
    setFormOpen(true);
  }

  function handleDelete(condition: ConditionWithCount) {
    setSelected(condition);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: ConditionFormData) {
    const result = selected
      ? await updateCondition(selected.id, data)
      : await createCondition(data);

    if (result.success) {
      toast.success(selected ? "Kondisi berhasil diperbarui" : "Kondisi berhasil ditambahkan");
      setFormOpen(false);
      setSelected(null);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteConfirm() {
    if (!selected) return;
    const result = await deleteCondition(selected.id);
    if (result.success) {
      toast.success("Kondisi berhasil dihapus");
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
          Tambah Kondisi
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={conditions}
        searchKey="name"
        searchPlaceholder="Cari kondisi..."
      />
      <ConditionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        onSubmit={handleFormSubmit}
        condition={selected}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
        title="Hapus Kondisi"
        description={`Apakah Anda yakin ingin menghapus kondisi "${selected?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
