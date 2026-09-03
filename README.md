# Trackio

Aplicación web para llevar el control del peso diario: registro rápido, historial con
filtros, gráfico semanal, racha de constancia y mapa de actividad de los últimos 3 meses.

Next.js 16 (App Router) · React 19 · Tailwind 4 · Firebase Auth + Realtime Database.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Las variables de entorno están documentadas en [`.env.example`](.env.example). Necesitas
un proyecto de Firebase con **Authentication** (correo/contraseña y Google) y **Realtime
Database** activados.

## Reglas de seguridad

Los datos están protegidos por [`database.rules.json`](database.rules.json): cada persona
solo puede leer y escribir bajo su propio `uid`. **Hay que desplegarlas** — sin ellas la
base de datos queda abierta a cualquiera:

```bash
npx firebase-tools@latest deploy --only database
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |
| `npm test` | Tests de la lógica de estadísticas |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── app/              Rutas (App Router)
│   ├── api/session/  Intercambia el idToken de Firebase por una cookie httpOnly
│   ├── login/        Inicio de sesión
│   ├── register/     Alta de cuenta
│   ├── goals/        Racha y mapa de actividad
│   └── history/      Evolución, gráfico y registros filtrables
├── components/       Componentes de UI
├── lib/
│   ├── actions.ts    Server Actions (leer, crear y borrar registros)
│   ├── session.ts    DAL: verifica la sesión en cada render
│   ├── firebase.ts   SDK de cliente
│   ├── firebase-admin.ts  SDK de servidor
│   └── stats.ts      Cálculos puros (racha, cambios, heatmap)
└── proxy.ts          Redirecciones optimistas de rutas privadas
```

## Cómo funciona la autenticación

1. El navegador se autentica con Firebase y obtiene un `idToken`.
2. `POST /api/session` lo verifica con el SDK de administrador y devuelve una cookie de
   sesión `httpOnly`.
3. [`src/proxy.ts`](src/proxy.ts) hace una comprobación optimista (¿existe la cookie?) para
   redirigir a `/login` sin coste.
4. La verificación real vive en [`src/lib/session.ts`](src/lib/session.ts) y corre en cada
   render, junto a los datos.
5. Las reglas de la base de datos son la última línea de defensa: aunque todo lo anterior
   fallara, nadie puede leer registros de otro `uid`.
