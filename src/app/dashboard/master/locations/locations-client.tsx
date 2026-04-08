"use client";

import { useState } from "react";
import type { Location } from "@generated/prisma/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LocationFormDialog } from "./location-form-dialog";
import { getColumns } from "./columns";
import {
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/actions/locations";
import type { LocationFormData } from "@/lib/validations/master-data";

type LocationWithCount = Location & { _count: { assets: number } };

type LocationsClientProps = {
  locations: LocationWithCount[];
};

export function LocationsClient({ locations }: LocationsClientProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<LocationWithCount | null>(null);

  function handleEdit(location: LocationWithCount) {
    setSelected(location);
    setFormOpen(true);
  }

  function handleDelete(location: LocationWithCount) {
    setSelected(location);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: LocationFormData) {
    const result = selected
      ? await updateLocation(selected.id, data)
      : await createLocation(data);

    if (result.success) {
      toast.success(selected ? "Lokasi berhasil diperbarui" : "Lokasi berhasil ditambahkan");
      setFormOpen(false);
      setSelected(null);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteConfirm() {
    if (!selected) return;
    const result = await deleteLocation(selected.id);
    if (result.success) {
      toast.success("Lokasi berhasil dihapus");
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
          Tambah Lokasi
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
        searchPlaceholder="Cari lokasi..."
      />
      <LocationFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        onSubmit={handleFormSubmit}
        location={selected}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
        title="Hapus Lokasi"
        description={`Apakah Anda yakin ingin menghapus lokasi "${selected?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
