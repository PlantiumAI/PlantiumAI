import { count, eq } from "drizzle-orm";
import { Cpu, KeyRound, MapPinned, Users } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens, locations, sensors, users } from "@/db/schema";
import { KpiCard } from "@/components/kpi-card";

export default async function DashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  // Contas só-cliente sem empresa associada ainda não têm dados.
  const [sensorCount, locationCount, userCount, tokenCount] = companyId
    ? await Promise.all([
        db.select({ n: count() }).from(sensors).where(eq(sensors.companyId, companyId)),
        db.select({ n: count() }).from(locations).where(eq(locations.companyId, companyId)),
        db.select({ n: count() }).from(users).where(eq(users.companyId, companyId)),
        db.select({ n: count() }).from(deviceTokens).where(eq(deviceTokens.companyId, companyId)),
      ]).then((rows) => rows.map((r) => r[0]?.n ?? 0))
    : [0, 0, 0, 0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Visão geral</h1>
        <p className="text-sm text-muted">
          Resumo dos sensores e locais da sua empresa.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Cpu} label="Sensores" value={sensorCount} hint="instalados" />
        <KpiCard icon={MapPinned} label="Locais" value={locationCount} hint="estufas, vertical, containers" />
        <KpiCard icon={Users} label="Usuários" value={userCount} hint="da empresa" />
        <KpiCard icon={KeyRound} label="Tokens" value={tokenCount} hint="de dispositivo" />
      </section>

      <section className="rounded-2xl glass p-6">
        <h2 className="font-display text-lg font-600">Próximos passos</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
          <li>Cadastre seus locais em <strong>Locais</strong> (estufa, vertical ou container).</li>
          <li>Gere um <strong>token</strong> e grave no firmware do ESP32.</li>
          <li>Registre seus <strong>sensores</strong> e vincule ao local e token.</li>
          <li>As leituras aparecerão automaticamente aqui conforme o firmware enviar dados.</li>
        </ul>
      </section>
    </div>
  );
}
