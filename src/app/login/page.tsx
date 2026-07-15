import Link from "next/link";
import FormularioAuth from "@/components/FormularioAuth";

export default function LoginPage() {
  return (
    <main className="flex w-full flex-1 flex-col justify-center gap-8 px-6 py-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-sm text-[var(--text-secondary)]">Inicia sesión para continuar</p>
      </header>

      <FormularioAuth modo="login" />

      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-[var(--brand)]">
          Crear cuenta
        </Link>
      </p>
    </main>
  );
}
