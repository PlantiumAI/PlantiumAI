import { Button } from "@plantium/ui";

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "24px", background: "var(--pl-bg-base)", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
    {children}
  </div>
);

export function Primary() {
  return (
    <Wrap>
      <Button variant="primary" size="sm">Salvar sm</Button>
      <Button variant="primary" size="md">Confirmar</Button>
      <Button variant="primary" size="lg">Acessar painel lg</Button>
    </Wrap>
  );
}

export function Secondary() {
  return (
    <Wrap>
      <Button variant="secondary" size="sm">Cancelar sm</Button>
      <Button variant="secondary" size="md">Ver histórico</Button>
      <Button variant="secondary" size="lg">Exportar relatório lg</Button>
    </Wrap>
  );
}

export function Ghost() {
  return (
    <Wrap>
      <Button variant="ghost" size="sm">Ignorar</Button>
      <Button variant="ghost" size="md">Saiba mais</Button>
      <Button variant="ghost" size="lg">Criar conta</Button>
    </Wrap>
  );
}

export function Disabled() {
  return (
    <Wrap>
      <Button variant="primary" disabled>Processando…</Button>
      <Button variant="secondary" disabled>Indisponível</Button>
      <Button variant="ghost" disabled>Bloqueado</Button>
    </Wrap>
  );
}

export function Block() {
  return (
    <div style={{ padding: "24px", background: "var(--pl-bg-base)", width: "320px" }}>
      <Button variant="primary" block>Entrar na plataforma</Button>
      <div style={{ marginTop: "12px" }}>
        <Button variant="secondary" block>Entrar com Google</Button>
      </div>
    </div>
  );
}
