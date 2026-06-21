"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "./demo-state";

const PlantLogo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,.3)" }}>
    <circle cx="19" cy="19" r="19" fill="#22c55e" />
    <path d="M19 8c-2 4-6 8-6 13a6 6 0 0012 0c0-5-4-9-6-13z" fill="#fff" opacity=".9" />
    <path d="M19 14c2 3 4 5 4 8a4 4 0 01-8 0c0-3 2-5 4-8z" fill="#16a34a" opacity=".6" />
  </svg>
);

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 13, padding: "11px 13px", borderRadius: 12,
  border: "none", background: "transparent", textAlign: "left", width: "100%",
  fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: "var(--pl-text-muted)",
  cursor: "pointer", transition: "background .15s,color .15s", textDecoration: "none",
};

const NAV = [
  { href: "/app", exact: true, label: "Dashboard", icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg> },
  { href: "/app/locais", label: "Locais monitorados", icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg> },
  { href: "/app/sensores", label: "Sensores", icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /></svg> },
  { href: "/app/alertas", label: "Alertas", icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d="M12 4l9 16H3z" /><path d="M12 10v4" /><circle cx="12" cy="17.5" r=".6" fill="currentColor" /></svg> },
  { href: "/app/configuracoes", label: "Configurações", icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" strokeLinecap="round" /></svg> },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, drawer, setPanel, initials, name } = useDemo();
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <aside
      id="pl-side"
      data-collapsed={collapsed ? "true" : "false"}
      data-open={drawer ? "true" : "false"}
      style={{ background: "var(--pl-surface-glass)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderRight: "1px solid var(--pl-border-glass)", display: "flex", flexDirection: "column", gap: 4, padding: "18px 14px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "6px 8px 14px" }}>
        <PlantLogo />
        {!collapsed && <span className="pl-brandtext pl-font-display" style={{ fontWeight: 700, fontSize: 18, whiteSpace: "nowrap" }}>PlantiumAI</span>}
      </div>

      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className="pl-navitem" data-nav={isActive(item.href, item.exact) ? "true" : "false"} style={navBtnStyle}>
          {item.icon}
          {!collapsed && <span className="pl-navlabel">{item.label}</span>}
        </Link>
      ))}
      <button className="pl-navitem" onClick={() => setPanel("data")} style={navBtnStyle}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
        {!collapsed && <span className="pl-navlabel">Relatórios &amp; dados</span>}
      </button>

      <div style={{ flex: 1 }} />
      <button onClick={() => setPanel("help")} className="pl-navitem" style={{ ...navBtnStyle, fontSize: 13, color: "var(--pl-text-faint)" }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.4.8-1.4 1.7v.3" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>
        {!collapsed && <span className="pl-navlabel">Guia rápido</span>}
      </button>
      <button onClick={() => setCollapsed((p) => !p)} className="pl-navitem" style={{ ...navBtnStyle, fontSize: 13, color: "var(--pl-text-faint)" }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: collapsed ? "rotate(180deg)" : "none" }}><path d="M15 6l-6 6 6 6" /></svg>
        {!collapsed && <span className="pl-navlabel">Recolher menu</span>}
      </button>
      <button onClick={() => setPanel("profile")} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 10px", marginTop: 4, border: "none", borderTop: "1px solid var(--pl-border-subtle)", background: "transparent", color: "var(--pl-text-base)", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pl-brand-green-tint)", color: "var(--pl-brand-green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</span>
        {!collapsed && (
          <div className="pl-sidefoot-meta" style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
            <span className="pl-chip pl-chip--ideal" style={{ alignSelf: "flex-start" }}><span className="pl-chip__dot" style={{ animation: "pl-pulse 1.6s infinite" }} />Conectado · demo</span>
          </div>
        )}
      </button>
    </aside>
  );
}
