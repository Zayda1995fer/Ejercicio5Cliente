// Carga los archivos JavaScript reales del frontend (Ejercicio5Cliente) dentro del
// navegador simulado (jsdom) para poder probar sus funciones sin modificar el código.
const fs = require('fs');
const path = require('path');
const { createInstrumenter } = require('istanbul-lib-instrument');

const RUTA_JS = path.resolve(__dirname, '../../src/main/resources/static/js');
const instrumentador = createInstrumenter({ esModules: false, compact: false });

function cargarScript(nombreArchivo, { medirCobertura = true } = {}) {
  const ruta = path.join(RUTA_JS, nombreArchivo);
  let codigo = fs.readFileSync(ruta, 'utf8');
  // Se instrumenta el archivo para que "npm run test:cobertura" mida qué líneas se ejecutaron.
  if (medirCobertura) codigo = instrumentador.instrumentSync(codigo, ruta);
  // Se ejecuta en el ámbito global, igual que una etiqueta <script> en la página.
  (0, eval)(codigo);
}

function cargarJQuery() {
  if (!window.jQuery) cargarScript('jquery-3.7.1.min.js', { medirCobertura: false });
  return window.jQuery;
}

// Espera (máximo 2 s) a que se cumpla una condición; se usa porque jQuery ejecuta
// $(document).ready de forma asíncrona.
async function esperarHasta(condicion) {
  const limite = Date.now() + 2000;
  while (!condicion() && Date.now() < limite) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

module.exports = { cargarScript, cargarJQuery, esperarHasta, RUTA_JS };
