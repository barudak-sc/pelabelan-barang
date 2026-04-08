"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Condition } from "@generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type ConditionWithCount = Condition & { _count: { assets: number } };

function getSeverityColor(level: number) {
  if (level <= 1) return "bg-green-100 text-green-800";
  if (level <= 2) return "bg-yellow-100 text-yellow-800";
  if (level <= 3) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export function getColumns(
  onEdit: (condition: ConditionWithCount) => void,
  onDelete: (condition: ConditionWithCount) => void
): ColumnDef<ConditionWithCount>[] {
  return [
    {
      accessorKey: "name",
      header: "Nama Kondisi",
    },
    {
      accessorKey: "severityLevel",
      header: "Severity Level",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getSeverityColor(row.original.severityLevel)}
        >
          {row.original.severityLevel}
        </Badge>
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
