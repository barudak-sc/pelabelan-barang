"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Condition } from "@generated/prisma/client";
import {
  conditionSchema,
  type ConditionFormData,
} from "@/lib/validations/master-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConditionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConditionFormData) => Promise<void>;
  condition?: Condition | null;
};

export function ConditionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  condition,
}: ConditionFormDialogProps) {
  const isEdit = !!condition;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConditionFormData>({
    resolver: zodResolver(conditionSchema),
    defaultValues: { name: "", severityLevel: 1 },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: condition?.name ?? "",
        severityLevel: condition?.severityLevel ?? 1,
      });
    }
  }, [open, condition, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kondisi" : "Tambah Kondisi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kondisi</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="severityLevel">
              Severity Level (1 = Baik, 4 = Hilang)
            </Label>
            <Input
              id="severityLevel"
              type="number"
              min={1}
              max={10}
              {...register("severityLevel")}
            />
            {errors.severityLevel && (
              <p className="text-sm text-destructive">
                {errors.severityLevel.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
