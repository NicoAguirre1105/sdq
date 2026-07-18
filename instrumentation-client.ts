// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://950dfc01d9744f3fc9416f9eb374bc68@o4511725996474368.ingest.us.sentry.io/4511726005190656",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Ruido de in-app browsers (Instagram/Facebook/TikTok, Android y iOS): sus
  // scripts nativos de tracking intentan avisarle a la app host vía
  // postMessage()/window.webkit.messageHandlers cuando el usuario navega, y
  // fallan si la Activity/WKWebView ya se destruyó (usuario cierra el in-app
  // browser a mitad de navegación). No es código nuestro — todos los frames
  // del stack quedan en el pseudo-protocolo "app://" (nunca en nuestro
  // dominio/bundle), pero el mensaje exacto varía según plataforma ("Java
  // object is gone" en Android, "window.webkit.messageHandlers" en iOS) y
  // `denyUrls` no lo filtró de forma confiable para la variante iOS pese a
  // estar desplegado — por eso acá se decide con lógica propia en vez de
  // depender de la heurística interna de Sentry para extraer la URL.
  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    const isInAppBrowserBridgeNoise =
      frames.length > 0 && frames.every((frame) => (frame.filename ?? "").startsWith("app://"));
    return isInAppBrowserBridgeNoise ? null : event;
  },

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
