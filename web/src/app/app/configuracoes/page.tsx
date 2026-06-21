"use client";

import { useDemo } from "@/components/app/demo-state";
import type { Settings } from "@/lib/plantium-demo";

export default function ConfiguracoesPage() {
  const { settings, toggleSetting, isDark, toggleTheme, showToast, fullName, email, role } = useDemo();
  const notif: { k: keyof Settings; t: string; d: string }[] = [
    { k: "notifEmail", t: "Alertas por email", d: "Resumo enviado ao seu email" },
    { k: "notifPush", t: "Notificações push", d: "No app e no celular" },
    { k: "notifCrit", t: "Apenas críticos", d: "Notificar somente alertas críticos" },
    { k: "notifWeekly", t: "Relatório semanal", d: "PDF toda segunda-feira" },
  ];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>Configurações</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>Perfil, propriedade, notificações e integrações</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18, alignItems: "start" }}>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600 }}>Perfil</span>
          <div className="pl-field"><label className="pl-field__label">Nome</label><input className="pl-input" defaultValue={fullName} key={"cn" + fullName} /></div>
          <div className="pl-field"><label className="pl-field__label">Email</label><input className="pl-input" defaultValue={email} key={"ce" + email} /></div>
          <div className="pl-field"><label className="pl-field__label">Função</label><input className="pl-input" defaultValue={role} disabled /></div>
        </div>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600 }}>Propriedade</span>
          <div className="pl-field"><label className="pl-field__label">Nome da fazenda</label><input className="pl-input" defaultValue="Fazenda Boa Vista" /></div>
          <div className="pl-field"><label className="pl-field__label">Unidade principal</label><input className="pl-input" defaultValue="Unidade SP" /></div>
          <div className="pl-field"><label className="pl-field__label">Localização</label><input className="pl-input" defaultValue="Campinas, SP" /></div>
        </div>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600, paddingBottom: 8 }}>Notificações</span>
          {notif.map((item, i, arr) => (
            <div key={item.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--pl-border-subtle)" : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 14, fontWeight: 500 }}>{item.t}</span><span style={{ fontSize: 12, color: "var(--pl-text-muted)" }}>{item.d}</span></div>
              <button className="pl-switch" data-on={settings[item.k] ? "true" : "false"} onClick={() => toggleSetting(item.k)} aria-label={item.t} />
            </div>
          ))}
        </div>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600 }}>Limiares dos sensores</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 66px 66px", gap: 10, alignItems: "center", fontSize: 12, color: "var(--pl-text-faint)", textTransform: "uppercase", letterSpacing: ".04em" }}><span>Sensor</span><span style={{ textAlign: "center" }}>Mín</span><span style={{ textAlign: "center" }}>Máx</span></div>
          {([["Umidade do solo (%)", 35, 65], ["Temperatura do ar (°C)", 19, 27], ["CO₂ (ppm)", 400, 650], ["pH do solo", "5,5", "7,5"]] as [string, string | number, string | number][]).map(([name, min, max], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 66px 66px", gap: 10, alignItems: "center" }}><span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span><input className="pl-input" defaultValue={min} style={{ padding: "9px 6px", textAlign: "center", minWidth: 0 }} /><input className="pl-input" defaultValue={max} style={{ padding: "9px 6px", textAlign: "center", minWidth: 0 }} /></div>
          ))}
        </div>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600, paddingBottom: 8 }}>Integrações</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--pl-border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 14, fontWeight: 500 }}>Power BI</span><span style={{ fontSize: 12, color: "var(--pl-text-muted)" }}>Sincronização automática de leituras</span></div>
            <button className="pl-switch" data-on={settings.pbiSync ? "true" : "false"} onClick={() => toggleSetting("pbiSync")} aria-label="Power BI" />
          </div>
          <div className="pl-field" style={{ paddingTop: 12 }}><label className="pl-field__label">Chave da API REST</label><input className="pl-input" defaultValue="pl_live_••••••••3f8a" /></div>
        </div>
        <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600, paddingBottom: 8 }}>Aparência</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--pl-border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 14, fontWeight: 500 }}>Tema escuro</span><span style={{ fontSize: 12, color: "var(--pl-text-muted)" }}>Alternar entre claro e escuro</span></div>
            <button className="pl-switch" data-on={isDark ? "true" : "false"} onClick={toggleTheme} aria-label="Tema escuro" />
          </div>
          <div className="pl-field" style={{ paddingTop: 12 }}><label className="pl-field__label">Idioma</label><select className="pl-input"><option>Português (BR)</option><option>English</option><option>Español</option></select></div>
        </div>
      </div>
      <button className="pl-btn pl-btn--primary" onClick={() => showToast("Configurações salvas")} style={{ alignSelf: "flex-start", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-11" /></svg>Salvar alterações
      </button>
    </section>
  );
}
