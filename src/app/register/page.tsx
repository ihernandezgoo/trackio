import Link from "next/link";
import FormularioAuth from "@/components/FormularioAuth";

export default function RegisterPage() {
  return (
    <main className="flex w-full flex-1 flex-col justify-center gap-8 px-6 py-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="text-sm text-[var(--text-secondary)]">Empieza a registrar tu peso hoy</p>
      </header>

      <FormularioAuth modo="register" />

      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand)]">
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
