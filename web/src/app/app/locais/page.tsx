import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { LocationForm } from "@/components/location-form";
import { DeleteForm } from "@/components/delete-form";
import { createLocation, deleteLocation } from "./actions";

const typeLabel: Record<string, string> = {
  estufa: "Estufa",
  plantacao_vertical: "Plantação vertical",
  container: "Container",
};

export default async function LocaisPage() {
  const session = await auth();
  const companyId = session!.user.companyId;
  const rows = companyId
    ? await db
        .select()
        .from(locations)
        .where(eq(locations.companyId, companyId))
        .orderBy(desc(locations.createdAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Locais</h1>
        <p className="text-sm text-muted">
          Estufas, plantações verticais e containers da sua empresa.
        </p>
      </header>

      <section className="rounded-2xl glass p-5">
        <h2 className="mb-3 font-display text-base font-600">Novo local</h2>
        <LocationForm action={createLocation} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <div className="rounded-2xl glass p-8 text-center text-sm text-muted sm:col-span-2 lg:col-span-3">
            Nenhum local cadastrado ainda. Adicione o primeiro acima.
          </div>
        )}
        {rows.map((l) => (
          <div key={l.id} className="flex flex-col rounded-2xl glass p-5">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                {typeLabel[l.type] ?? l.type}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/app/locais/${l.id}`}
                  aria-label="Editar"
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-black/5 hover:text-brand dark:hover:bg-white/10"
                >
                  <Pencil size={15} />
                </Link>
                <DeleteForm action={deleteLocation} id={l.id} confirmLabel={`Excluir "${l.name}"?`} />
              </div>
            </div>
            <h3 className="mt-2 font-display text-base font-600">{l.name}</h3>
            {l.description && <p className="mt-1 text-sm text-muted">{l.description}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
