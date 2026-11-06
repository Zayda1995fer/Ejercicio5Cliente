/**
 * Pruebas automáticas de login.js (pantalla de inicio de sesión del frontend).
 * La comunicación con el backend ($.ajax) se simula, por lo que NO se necesita
 * tener corriendo el backend ni la base de datos.
 */
const { cargarScript, cargarJQuery } = require('./utilidades');

let $;
let mostrarToast;

function prepararPantallaLogin() {
  // Mismos id que usa templates/login.html
  document.body.innerHTML = `
    <input type="email" id="exampleInputEmail1">
    <input type="password" id="exampleInputPassword1">
    <div id="alerta1">Ingrese un email y una contraseña</div>
    <div id="alerta2">Ingrese un email</div>
    <div id="alerta3">Ingrese una direccion de correo electronico válida</div>
    <div id="alerta4">Ingrese una contraseña</div>
    <div id="alerta5">El usuario o contraseña no existen</div>
    <div id="alerta6">No se pudo conectar con el servidor, intente más tarde</div>
  `;
}

function escribir(correo, contrasena) {
  document.getElementById('exampleInputEmail1').value = correo;
  document.getElementById('exampleInputPassword1').value = contrasena;
}

// Devuelve el id del aviso (toast) que se mostró en pantalla, o null si no se mostró ninguno.
function avisoMostrado() {
  if (window.bootstrap.Toast.mock.calls.length === 0) return null;
  return window.bootstrap.Toast.mock.calls[0][0].id;
}

beforeAll(() => {
  $ = cargarJQuery();
  cargarScript('login.js');
});

beforeEach(() => {
  prepararPantallaLogin();
  mostrarToast = jest.fn();
  window.bootstrap = { Toast: jest.fn(() => ({ show: mostrarToast })) };
  localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Login (login.js)', () => {

  test('AUT-E02 Formulario: con datos válidos la validación permite enviar la petición a /verificarLogin', () => {
    const ajax = jest.spyOn($, 'ajax').mockImplementation(() => {});
    escribir('ana22533@cbtis75.edu.mx', '0722');

    window.validarLogin();

    expect(ajax).toHaveBeenCalledTimes(1);
    const peticion = ajax.mock.calls[0][0];
    expect(peticion.url).toBe('/verificarLogin');
    expect(peticion.type).toBe('POST');
    expect(JSON.parse(peticion.data)).toEqual({
      correo_electronico: 'ana22533@cbtis75.edu.mx',
      contrasena: '0722',
    });
    expect(avisoMostrado()).toBeNull();
  });

  test('AUT-E05 Servicio de login: respuesta válida del backend guarda el usuario en la sesión', () => {
    const usuario = { id_usuario: 131, nombre: 'Ana Paola Ramírez Vázquez', rol: 'Estudiante' };
    jest.spyOn($, 'ajax').mockImplementation((opciones) => opciones.success(usuario));
    escribir('ana22533@cbtis75.edu.mx', '0722');

    window.validarLogin();

    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(usuario);
    expect(avisoMostrado()).toBeNull();
  });

  test('AUT-F02 Formulario: con datos vacíos o inválidos se impide el envío y se muestra el error', () => {
    const ajax = jest.spyOn($, 'ajax').mockImplementation(() => {});

    escribir('', '');
    window.validarLogin();
    expect(avisoMostrado()).toBe('alerta1'); // "Ingrese un email y una contraseña"

    window.bootstrap.Toast.mockClear();
    escribir('correo-invalido', '1234');
    window.validarLogin();
    expect(avisoMostrado()).toBe('alerta3'); // "Ingrese una direccion de correo electronico válida"

    window.bootstrap.Toast.mockClear();
    escribir('ana22533@cbtis75.edu.mx', '');
    window.validarLogin();
    expect(avisoMostrado()).toBe('alerta4'); // "Ingrese una contraseña"

    expect(ajax).not.toHaveBeenCalled();
  });

  test('AUT-F07 Formulario: con contraseña pero sin email se impide el envío y se pide el email', () => {
    // PRACTICA 3: caso agregado para cubrir la rama "solo falta el email" de validarLogin
    const ajax = jest.spyOn($, 'ajax').mockImplementation(() => {});
    escribir('', '0722');

    window.validarLogin();

    expect(avisoMostrado()).toBe('alerta2'); // "Ingrese un email"
    expect(document.activeElement.id).toBe('exampleInputEmail1');
    expect(ajax).not.toHaveBeenCalled();
  });

  test('AUT-F03Vista: el usuario no existe (backend responde nombre "000") y la interfaz lo informa', () => {
    jest.spyOn($, 'ajax').mockImplementation((opciones) =>
      opciones.success({ id_usuario: null, nombre: '000' }));
    escribir('noexiste@cbtis75.edu.mx', 'incorrecta');

    window.validarLogin();

    expect(avisoMostrado()).toBe('alerta5'); // "El usuario o contraseña no existen"
    expect(mostrarToast).toHaveBeenCalled();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  test('AUT-F04 Servicio de login: si el backend responde con error (HTTP 500) la interfaz debe informarlo', () => {
    // Se simula la respuesta de error del servidor: si login.js definiera un manejador
    // de error (opción "error" de $.ajax), se ejecutaría aquí.
    jest.spyOn($, 'ajax').mockImplementation((opciones) => {
      if (typeof opciones.error === 'function') {
        opciones.error({ status: 500, statusText: 'Internal Server Error' });
      }
    });
    escribir('prueba.api@cbtis75.edu.mx', 'Prueba123');

    window.validarLogin();

    // Resultado esperado: se muestra un mensaje de error al usuario.
    // PRACTICA 3: login.js ya define el manejador de error y muestra el aviso alerta6
    expect(avisoMostrado()).toBe('alerta6');
    expect(mostrarToast).toHaveBeenCalled();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});
