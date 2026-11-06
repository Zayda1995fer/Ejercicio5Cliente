/**
 * Pruebas automáticas de inicio.js (vista "Mis Proyectos" del frontend).
 * La comunicación con el backend ($.ajax) se simula, por lo que NO se necesita
 * tener corriendo el backend ni la base de datos.
 */
const { cargarScript, cargarJQuery, esperarHasta } = require('./utilidades');

let $;

const PROYECTOS = [
  { id_proyecto: 197, nombre: 'My API Rest', descripcion: 'Desarrollar un Api Rest',
    fecha_inicio: '2024-05-31', fecha_finalizacion: '2024-06-29',
    estado_proyecto: 'En proceso', fondo: '/Images/animacion1.gif' },
  { id_proyecto: 198, nombre: 'Proyecto de prueba', descripcion: 'Creado en la prueba',
    fecha_inicio: '2026-10-01', fecha_finalizacion: '2026-10-30',
    estado_proyecto: 'Pendiente', fondo: '/Images/verde.png' },
];

function prepararPantallaInicio() {
  // Mismos id que usa templates/inicio.html
  document.body.innerHTML = `
    <div id="cardContainer" class="row"></div>
    <div id="modalEditar"><h1 class="modal-title">Editar</h1>
      <input type="hidden" id="id">
      <input id="editarNombre">
      <textarea id="editarDescripcion"></textarea>
      <input type="date" id="editar_fecha_inicio">
      <input type="date" id="editar_fecha_finalizacion">
      <select id="editar_estado_proyecto">
        <option value="Pendiente">Pendiente</option>
        <option value="En proceso">En proceso</option>
        <option value="Terminado">Terminado</option>
      </select>
      <input type="hidden" id="editar_fondo">
    </div>
    <label id="textAlerta"></label>
    <input id="hiddenId" type="hidden">
  `;
}

// Carga inicio.js simulando la respuesta del backend para /consultarProyectos
async function abrirVistaInicio(respuesta) {
  const ajax = jest.spyOn($, 'ajax').mockImplementation((opciones) => {
    if (opciones.url === '/consultarProyectos') respuesta(opciones);
  });
  cargarScript('inicio.js');
  await esperarHasta(() => ajax.mock.calls.length > 0);
  return ajax;
}

beforeAll(() => {
  $ = cargarJQuery();
});

beforeEach(() => {
  prepararPantallaInicio();
  $.fn.modal = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Vista Mis Proyectos (inicio.js)', () => {

  test('AUT-E01 Servicio de consulta: la respuesta válida del backend se procesa correctamente', async () => {
    const ajax = await abrirVistaInicio((op) => op.success(PROYECTOS));

    const peticion = ajax.mock.calls[0][0];
    expect(peticion.url).toBe('/consultarProyectos');
    expect(peticion.type).toBe('POST');
    expect(document.querySelectorAll('#cardContainer .card')).toHaveLength(2);
  });

  test('AUT-E03 Componente / Vista: los datos consultados se presentan en la interfaz', async () => {
    await abrirVistaInicio((op) => op.success(PROYECTOS));

    const titulos = [...document.querySelectorAll('#cardContainer .card-title')].map((e) => e.textContent);
    expect(titulos).toEqual(['My API Rest', 'Proyecto de prueba']);
    const texto = document.getElementById('cardContainer').textContent;
    expect(texto).toContain('Estado del proyecto: En proceso');
    expect(texto).toContain('Fecha de inicio: 2024-05-31');
    expect(document.querySelector('#cardContainer a.btn').getAttribute('href'))
      .toBe('/proyecto?id_proyecto=197');
  });

  test('AUT-E04 Componente Editar: al editar se cargan en el formulario los datos del proyecto', async () => {
    const ajax = await abrirVistaInicio((op) => op.success([]));
    ajax.mockImplementation((opciones) => {
      if (opciones.url === '/actualizarProyecto') opciones.success(PROYECTOS[0]);
    });

    window.actualizarProyecto(197);

    const peticion = ajax.mock.calls.find((c) => c[0].url === '/actualizarProyecto')[0];
    expect(JSON.parse(peticion.data)).toEqual({ id_proyecto: 197 });
    expect(document.getElementById('id').value).toBe('197');
    expect(document.getElementById('editarNombre').value).toBe('My API Rest');
    expect(document.getElementById('editar_fecha_inicio').value).toBe('2024-05-31');
    expect(document.getElementById('editar_estado_proyecto').value).toBe('En proceso');
    expect($.fn.modal).toHaveBeenCalledWith('show');
  });

  test('AUT-E06 Eliminación: al confirmar se envía el id del proyecto a /eliminarProyecto', async () => {
    const ajax = await abrirVistaInicio((op) => op.success(PROYECTOS));

    window.obtenerInfo(198, 'hiddenId', 'Proyecto de prueba');
    expect(document.getElementById('textAlerta').innerText).toContain('Proyecto de prueba');
    window.botonEliminar();

    const peticion = ajax.mock.calls.find((c) => c[0].url === '/eliminarProyecto')[0];
    expect(peticion.type).toBe('POST');
    expect(JSON.parse(peticion.data)).toEqual({ id_proyecto: '198' });
  });

  test('AUT-F01 Servicio de consulta: si el backend devuelve error, se captura y la vista no se rompe', async () => {
    await abrirVistaInicio((op) => op.error({ status: 500, statusText: 'Internal Server Error' }));

    expect(console.error).toHaveBeenCalledWith('Error al cargar proyectos:', expect.objectContaining({ status: 500 }));
    expect(document.querySelectorAll('#cardContainer .card')).toHaveLength(0);
  });

  // ---- PRACTICA 3: pruebas agregadas para cubrir todas las funciones de inicio.js ----

  test('AUT-E07 Selector de fondo: guardarRutaImagen coloca la ruta elegida en el campo oculto', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="fondo">');

    window.guardarRutaImagen('/Images/verde.png');

    expect(document.getElementById('fondo').value).toBe('/Images/verde.png');
  });

  test('AUT-E08 Eliminación: si el backend confirma, la vista vuelve a cargar "inicio"', async () => {
    const ajax = await abrirVistaInicio((op) => op.success([]));

    window.eliminarProyecto(197);

    const peticion = ajax.mock.calls.find((c) => c[0].url === '/eliminarProyecto')[0];
    expect(JSON.parse(peticion.data)).toEqual({ id_proyecto: 197 });
    // jsdom no navega; se verifica que el callback de exito se ejecuta sin errores
    expect(() => peticion.success()).not.toThrow();
  });

  test('AUT-F05 Componente Editar: si el backend falla, se registra el error y el formulario no cambia', async () => {
    const ajax = await abrirVistaInicio((op) => op.success([]));
    ajax.mockImplementation((opciones) => {
      if (opciones.url === '/actualizarProyecto') opciones.error();
    });

    window.actualizarProyecto(197);

    expect(console.log).toHaveBeenCalledWith('Error');
    expect(document.getElementById('editarNombre').value).toBe('');
    expect($.fn.modal).not.toHaveBeenCalled();
  });

  test('AUT-E09 Nuevo proyecto: sin fondo elegido se asigna /Images/blanco.png', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="fondo" value="">');

    window.asignarFondo();

    expect(document.getElementById('fondo').value).toBe('/Images/blanco.png');
  });

  test('AUT-E10 Nuevo proyecto: si ya hay fondo elegido se conserva', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="fondo" value="/Images/verde.png">');

    window.asignarFondo();

    expect(document.getElementById('fondo').value).toBe('/Images/verde.png');
  });

  test('AUT-E11 Editar proyecto: sin fondo elegido se asigna /Images/blanco.png', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="editarFondo" value="">');

    window.asignarFondoEditar();

    expect(document.getElementById('editarFondo').value).toBe('/Images/blanco.png');
  });

  test('AUT-E12 Editar proyecto: si ya hay fondo elegido se conserva', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="editarFondo" value="/Images/rosa.png">');

    window.asignarFondoEditar();

    expect(document.getElementById('editarFondo').value).toBe('/Images/rosa.png');
  });

  test('AUT-E13 Selector de fondo: cerrarFondos cierra el dialogo de imagenes', async () => {
    await abrirVistaInicio((op) => op.success([]));
    document.body.insertAdjacentHTML('beforeend', '<dialog id="imagenesFondo" open></dialog>');
    const dialogo = document.getElementById('imagenesFondo');
    dialogo.close = jest.fn();

    window.cerrarFondos();

    expect(dialogo.close).toHaveBeenCalledTimes(1);
  });

  test('AUT-F06 Selector de fondo: cerrarFondos sin dialogo en la pagina no provoca error', async () => {
    await abrirVistaInicio((op) => op.success([]));

    expect(() => window.cerrarFondos()).not.toThrow();
  });
});
