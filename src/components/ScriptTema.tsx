export const CLAVE_TEMA = "trackio-theme";

/**
 * Se ejecuta sincrónicamente mientras el navegador parsea el HTML, antes del
 * primer pintado, para que no haya flash de tema claro al recargar.
 * Ver node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
const CODIGO = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-theme-ready","")}catch(e){}})()`;

export default function ScriptTema() {
  return <script dangerouslySetInnerHTML={{ __html: CODIGO }} />;
}
