// Entry point para Phusion Passenger (cPanel "Setup Node.js App"), que no corre
// `next start` directo — espera un archivo que levante un servidor HTTP propio
// escuchando en process.env.PORT. Passenger inyecta ese PORT; no hardcodear otro.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
