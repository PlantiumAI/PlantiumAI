"use client";

import { Trash2 } from "lucide-react";

// Form genérico de exclusão. Recebe uma server action (lê `id` do FormData).
export function DeleteForm({
  action,
  id,
  confirmLabel = "Excluir este item?",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmLabel?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmLabel)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Excluir"
        className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
