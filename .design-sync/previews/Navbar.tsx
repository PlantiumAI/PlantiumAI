import { Navbar, Button } from "@plantium/ui";

export function LightWithLinks() {
  return (
    <div style={{ padding: "24px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)" }}>
      <Navbar
        brand="PlantiumAI"
        links={[
          { label: "Painel", href: "#", active: true },
          { label: "Estufas", href: "#" },
          { label: "Alertas", href: "#" },
          { label: "Relatórios", href: "#" },
        ]}
        theme="light"
        actions={<Button variant="primary" size="sm">Entrar</Button>}
      />
    </div>
  );
}

export function DarkWithLinks() {
  return (
    <div style={{ padding: "24px", background: "#0b1410" }} data-theme="dark">
      <Navbar
        brand="PlantiumAI"
        links={[
          { label: "Painel", href: "#" },
          { label: "Estufas", href: "#", active: true },
          { label: "Alertas", href: "#" },
        ]}
        theme="dark"
        actions={<Button variant="secondary" size="sm">Configurações</Button>}
      />
    </div>
  );
}
