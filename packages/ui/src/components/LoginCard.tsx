import type { FormEvent, ReactNode } from "react";
import { Button } from "./Button";

export interface LoginCardProps {
  /** Nome da marca. */
  brand?: string;
  /** Conteúdo do logo. */
  logo?: ReactNode;
  /** Subtítulo abaixo da marca. */
  subtitle?: string;
  /** Mostra o botão "Entrar com Google". */
  showGoogle?: boolean;
  /** Callback de submit (e-mail, senha). */
  onSubmit?: (data: { email: string; password: string }) => void;
}

/**
 * Card de login (glassmorphism): e-mail, senha, lembrar-me, esqueci a senha,
 * login social e criar conta.
 */
export function LoginCard({
  brand = "PlantiumAI",
  logo,
  subtitle = "Acesse o painel das suas estufas",
  showGoogle = true,
  onSubmit,
}: LoginCardProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
    onSubmit?.({ email, password });
  }

  return (
    <form className="pl-login" onSubmit={handleSubmit}>
      <span className="pl-login__brand">
        <span className="pl-navbar__logo">{logo ?? "P"}</span>
        {brand}
      </span>
      <p className="pl-login__subtitle">{subtitle}</p>

      <label className="pl-field">
        <span className="pl-field__label">E-mail</span>
        <input className="pl-input" type="email" name="email" placeholder="voce@fazenda.com" required />
      </label>

      <label className="pl-field">
        <span className="pl-field__label">Senha</span>
        <input className="pl-input" type="password" name="password" placeholder="••••••••" minLength={8} required />
      </label>

      <div className="pl-login__row">
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--pl-text-muted)" }}>
          <input type="checkbox" name="remember" /> Lembrar-me
        </label>
        <button type="button" className="pl-login__link">
          Esqueci a senha
        </button>
      </div>

      <Button type="submit" variant="primary" block>
        Entrar
      </Button>

      {showGoogle && (
        <>
          <div className="pl-login__divider">ou</div>
          <Button type="button" variant="secondary" block>
            Entrar com Google
          </Button>
        </>
      )}

      <p className="pl-login__footer">
        Não tem conta? <button type="button" className="pl-login__link">Criar conta</button>
      </p>
    </form>
  );
}

export default LoginCard;
