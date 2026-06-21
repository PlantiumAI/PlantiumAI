import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens, locations, sensors } from "@/db/schema";
import { SensorForm } from "@/components/sensor-form";
import { updateSensor } from "../../actions";

export default async function EditSensorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;

  if (!companyId) notFound();

  const [[sensor], locs, toks] = await Promise.all([
    db
      .select()
      .from(sensors)
      .where(and(eq(sensors.id, id), eq(sensors.companyId, companyId)))
      .limit(1),
    db.select({ id: locations.id, name: locations.name }).from(locations).where(eq(locations.companyId, companyId)),
    db
      .select({ id: deviceTokens.id, label: deviceTokens.label, prefix: deviceTokens.prefix })
      .from(deviceTokens)
      .where(eq(deviceTokens.companyId, companyId)),
  ]);

  if (!sensor) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/sensores" className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Voltar
      </Link>
      <header>
        <h1 className="font-display text-2xl font-700">Editar sensor</h1>
      </header>
      <section className="rounded-2xl glass p-5">
        <SensorForm
          action={updateSensor}
          locations={locs}
          tokens={toks}
          initial={{
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
            locationId: sensor.locationId,
            deviceTokenId: sensor.deviceTokenId,
          }}
          submitLabel="Salvar alterações"
        />
      </section>
    </div>
  );
}
