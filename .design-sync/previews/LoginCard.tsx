import { LoginCard } from "@plantium/ui";

export function WithGoogle() {
  return (
    <div style={{ padding: "32px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)", display: "flex", justifyContent: "center" }}>
      <LoginCard
        brand="PlantiumAI"
        subtitle="Acesse o painel das suas estufas"
        showGoogle
      />
    </div>
  );
}

export function EmailOnly() {
  return (
    <div style={{ padding: "32px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)", display: "flex", justifyContent: "center" }}>
      <LoginCard
        brand="PlantiumAI"
        subtitle="Faça login para continuar"
        showGoogle={false}
      />
    </div>
  );
}
