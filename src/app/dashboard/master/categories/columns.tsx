"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type CategoryWithCount = Category & { _count: { assets: number } };

export function getColumns(
  onEdit: (category: CategoryWithCount) => void,
  onDelete: (category: CategoryWithCount) => void
): ColumnDef<CategoryWithCount>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama Kategori",
    },
    {
      accessorKey: "codePrefix",
      header: "Kode Prefix",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.codePrefix}</Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
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
