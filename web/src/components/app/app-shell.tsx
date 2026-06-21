"use client";

import { DemoProvider, useDemo } from "./demo-state";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { SidePanel } from "./side-panel";

export function AppShell({
  name,
  email,
  role,
  signOut,
  children,
}: {
  name: string;
  email: string;
  role?: string;
  signOut: () => void;
  children: React.ReactNode;
}) {
  return (
    <DemoProvider name={name} email={email} role={role} signOut={signOut}>
      <ShellInner>{children}</ShellInner>
    </DemoProvider>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed, panel, drawer, closeAll, toast } = useDemo();
  const overlayOpen = !!panel || drawer;

  return (
    <div
      id="pl-shell"
      className="pl-root"
      style={{ minHeight: "100vh", background: "var(--pl-bg-gradient)", color: "var(--pl-text-base)", display: "grid", gridTemplateColumns: "var(--sb, 248px) 1fr", ["--sb" as string]: collapsed ? "76px" : "248px" } as React.CSSProperties}
    >
      <div id="pl-overlay" data-open={overlayOpen ? "true" : "false"} onClick={closeAll} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 55 }} />

      <AppSidebar />

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppTopbar />
        <main id="pl-main" style={{ padding: "24px 28px 44px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1500, width: "100%" }}>
          {children}
        </main>
      </div>

      <SidePanel />

      {toast && (
        <div className="pl-anim" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 70, display: "flex", alignItems: "center", gap: 10, padding: "13px 20px", borderRadius: 14, background: "var(--pl-text-base)", color: "var(--pl-surface-solid)", boxShadow: "var(--pl-shadow-float)", fontSize: 14, fontWeight: 500 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d977" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-11" /></svg>{toast}
        </div>
      )}
    </div>
  );
}
