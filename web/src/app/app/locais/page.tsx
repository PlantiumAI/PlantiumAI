import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { locations } from "@/db/schema";

const typeLabel: Record<string, string> = {
  estufa: "Estufa",
  plantacao_vertical: "Plantação vertical",
  container: "Container",
};

export default async function LocaisPage() {
  const session = await auth();
  const companyId = session!.user.companyId;
  const rows = companyId
    ? await db.select().from(locations).where(eq(locations.companyId, companyId))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Locais</h1>
        <p className="text-sm text-muted">
          Estufas, plantações verticais e containers da sua empresa.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <div className="rounded-2xl glass p-8 text-center text-sm text-muted sm:col-span-2 lg:col-span-3">
            Nenhum local cadastrado. O cadastro de locais chega na próxima etapa.
          </div>
        )}
        {rows.map((l) => (
          <div key={l.id} className="rounded-2xl glass p-5">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
              {typeLabel[l.type] ?? l.type}
            </span>
            <h3 className="mt-2 font-display text-base font-600">{l.name}</h3>
            {l.description && <p className="mt-1 text-sm text-muted">{l.description}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
