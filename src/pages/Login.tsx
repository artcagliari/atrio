import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";

export default function Login() {
  const { entrar } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("helena@silveiraprado.adv.br");
  const [senha, setSenha] = useState("demonstracao");
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setErro(null);
    setEnviando(true);
    setTimeout(() => {
      entrar(email);
      navigate((location.state as { de?: string } | null)?.de ?? "/atendimentos", { replace: true });
    }, 600);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      {/* Arco grande de vidro: entra subindo 12px */}
      <main className="vidro arco w-full max-w-[440px] !rounded-b-3xl px-8 pb-10 pt-24 animate-in fade-in-0 slide-in-from-bottom-3 duration-700 ease-suave sm:px-12 sm:pt-28">
        <div className="flex flex-col items-center text-center">
          <Logo variant="mark" tamanho={44} />
          <h1 className="mt-6 font-serif text-display-2">Bem-vindo ao Átrio</h1>
          <p className="mt-3 text-apoio text-muted-foreground">Cada cliente chega e é recebido aqui.</p>
        </div>

        <form onSubmit={enviar} className="mt-10 flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!erro && erro.includes("e-mail")} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={verSenha ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                aria-invalid={!!erro && erro.includes("senha")}
                className="pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={verSenha}
              >
                {verSenha ? <EyeOff className="size-[18px]" strokeWidth={1.5} aria-hidden="true" /> : <Eye className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {erro && (
            <p role="alert" className="text-apoio text-foreground">
              {erro}
            </p>
          )}

          <Button type="submit" variant="latao" size="lg" disabled={enviando} className="mt-3 w-full">
            {enviando && <Loader2 className="animate-spin" aria-hidden="true" />}
            {enviando ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 flex justify-between text-apoio">
          <button
            type="button"
            className="rounded text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => toast("Recuperação de senha", { description: "Enviaremos um link para o seu e-mail quando o back-end estiver conectado." })}
          >
            Esqueci a senha
          </button>
          <Link to="/onboarding" className="rounded text-muted-foreground transition-colors hover:text-foreground">
            Primeiro acesso
          </Link>
        </div>
      </main>
    </div>
  );
}
