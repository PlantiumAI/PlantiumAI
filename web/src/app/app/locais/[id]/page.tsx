import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { LocationForm } from "@/components/location-form";
import { updateLocation } from "../actions";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session!.user.role !== "empresa") notFound();
  const companyId = session!.user.companyId;

  const [loc] = companyId
    ? await db
        .select()
        .from(locations)
        .where(and(eq(locations.id, id), eq(locations.companyId, companyId)))
        .limit(1)
    : [];

  if (!loc) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/locais" className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <header>
        <h1 className="font-display text-2xl font-700">Editar local</h1>
      </header>
      <section className="rounded-2xl glass p-5">
        <LocationForm
          action={updateLocation}
          initial={{ id: loc.id, name: loc.name, type: loc.type, description: loc.description }}
          submitLabel="Salvar alterações"
        />
      </section>
    </div>
  );
}
