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

  // Ruido de in-app browsers (Instagram/Facebook/TikTok) en Android: su script
  // "navigation_performance_logger_android" intenta avisarle a la app nativa
  // vía postMessage() cuando el usuario navega, y falla si la Activity ya se
  // destruyó (usuario cierra el in-app browser a mitad de navegación). No es
  // código nuestro — el stack trace nunca pisa nuestro bundle. denyUrls corta
  // por el pseudo-protocolo "app://" que usan estos scripts inyectados
  // (ninguna URL real de nuestro sitio empieza así); ignoreErrors es un
  // respaldo por si el frame con esa URL no queda primero en el stack.
  denyUrls: [/^app:\/\//],
  ignoreErrors: ["Error invoking postMessage: Java object is gone"],

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
