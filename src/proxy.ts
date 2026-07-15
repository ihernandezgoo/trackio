import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RUTAS_PUBLICAS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tieneSesion = request.cookies.has("session");
  const esRutaPublica = RUTAS_PUBLICAS.includes(pathname);

  if (!tieneSesion && !esRutaPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (tieneSesion && esRutaPublica) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.png|apple-icon.png|manifest.webmanifest|logos).*)"],
};
