"use client";

import { useState } from "react";
import type { Category } from "@generated/prisma/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryFormDialog } from "./category-form-dialog";
import { getColumns } from "./columns";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";
import type { CategoryFormData } from "@/lib/validations/master-data";

type CategoryWithCount = Category & { _count: { assets: number } };

type CategoriesClientProps = {
  categories: CategoryWithCount[];
};

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CategoryWithCount | null>(null);

  function handleEdit(category: CategoryWithCount) {
    setSelected(category);
    setFormOpen(true);
  }

  function handleDelete(category: CategoryWithCount) {
    setSelected(category);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: CategoryFormData) {
    const result = selected
      ? await updateCategory(selected.id, data)
      : await createCategory(data);

    if (result.success) {
      toast.success(selected ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan");
      setFormOpen(false);
      setSelected(null);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteConfirm() {
    if (!selected) return;
    const result = await deleteCategory(selected.id);
    if (result.success) {
      toast.success("Kategori berhasil dihapus");
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
          Tambah Kategori
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Cari kategori..."
      />
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        onSubmit={handleFormSubmit}
        category={selected}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${selected?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
