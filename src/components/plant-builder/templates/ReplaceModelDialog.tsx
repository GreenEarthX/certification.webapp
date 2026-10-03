"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { outlineBtnClass } from "@/components/plant-builder/form-styles";
import type { TemplateDto } from "@/services/plant-builder/templates";

type Props = {
  /** The template awaiting confirmation; null closes the dialog. */
  template: TemplateDto | null;
  plantName: string;
  componentCount: number;
  connectionCount: number;
  applying: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Confirms that applying a template will replace the plant's current model. */
export default function ReplaceModelDialog({
  template,
  plantName,
  componentCount,
  connectionCount,
  applying,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog
      open={!!template}
      onOpenChange={(next) => {
        if (!next && !applying) onCancel();
      }}
    >
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-slate-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
            Replace canvas contents?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            &ldquo;{plantName}&rdquo; already has {plural(componentCount, "component")} and{" "}
            {plural(connectionCount, "connection")}. Applying &ldquo;{template?.name}&rdquo;
            removes them and their parameter values permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={applying} className={outlineBtnClass}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={applying}
            onClick={(e) => {
              // Keep the dialog open until the request settles.
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {applying ? "Replacing…" : "Replace"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
