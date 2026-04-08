"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Location } from "@generated/prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type LocationWithCount = Location & { _count: { assets: number } };

export function getColumns(
  onEdit: (location: LocationWithCount) => void,
  onDelete: (location: LocationWithCount) => void
): ColumnDef<LocationWithCount>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama Lokasi",
    },
    {
      accessorKey: "building",
      header: "Gedung",
      cell: ({ row }) => row.original.building || "-",
    },
    {
      accessorKey: "floor",
      header: "Lantai",
      cell: ({ row }) => row.original.floor || "-",
    },
    {
      id: "assetCount",
      header: "Jumlah Aset",
      cell: ({ row }) => row.original._count.assets,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent">
              <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
