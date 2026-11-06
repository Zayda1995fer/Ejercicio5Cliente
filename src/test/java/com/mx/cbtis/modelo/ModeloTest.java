package com.mx.cbtis.modelo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

/**
 * Pruebas de los modelos del cliente: constructor vacio, constructor completo y cada getter/setter.
 */
class ModeloTest {

	@Test
	void usuarioConstructorCompletoAsignaTodosLosCampos() {
		Usuario u = new Usuario(1, "Ana", "ana@cbtis75.edu.mx", "0722", "Estudiante", "#70FAB7");
		assertEquals(1, u.getId_usuario());
		assertEquals("Ana", u.getNombre());
		assertEquals("ana@cbtis75.edu.mx", u.getCorreo_electronico());
		assertEquals("0722", u.getContrasena());
		assertEquals("Estudiante", u.getRol());
		assertEquals("#70FAB7", u.getImagen_usuario());
	}

	@Test
	void usuarioSettersModificanLosCampos() {
		Usuario u = new Usuario();
		assertNull(u.getId_usuario());
		u.setId_usuario(2);
		u.setNombre("Liliana");
		u.setCorreo_electronico("liliana@cbtis75.edu.mx");
		u.setContrasena("ada");
		u.setRol("Admin");
		u.setImagen_usuario("#54EA01");
		assertEquals(2, u.getId_usuario());
		assertEquals("Liliana", u.getNombre());
		assertEquals("liliana@cbtis75.edu.mx", u.getCorreo_electronico());
		assertEquals("ada", u.getContrasena());
		assertEquals("Admin", u.getRol());
		assertEquals("#54EA01", u.getImagen_usuario());
	}

	@Test
	void proyectosConstructorYSetters() {
		Proyectos p = new Proyectos(197, "My API Rest", "Api con 5 tablas", "2024-05-31", "2024-06-29",
				"En proceso", "/Images/animacion1.gif");
		assertEquals(197, p.getId_proyecto());
		assertEquals("My API Rest", p.getNombre());
		assertEquals("Api con 5 tablas", p.getDescripcion());
		assertEquals("2024-05-31", p.getFecha_inicio());
		assertEquals("2024-06-29", p.getFecha_finalizacion());
		assertEquals("En proceso", p.getEstado_proyecto());
		assertEquals("/Images/animacion1.gif", p.getFondo());

		Proyectos vacio = new Proyectos();
		vacio.setId_proyecto(5);
		vacio.setNombre("Otro");
		vacio.setDescripcion("Desc");
		vacio.setFecha_inicio("2024-01-01");
		vacio.setFecha_finalizacion("2024-02-01");
		vacio.setEstado_proyecto("Terminado");
		vacio.setFondo("fondo.png");
		assertEquals(5, vacio.getId_proyecto());
		assertEquals("Otro", vacio.getNombre());
		assertEquals("Desc", vacio.getDescripcion());
		assertEquals("2024-01-01", vacio.getFecha_inicio());
		assertEquals("2024-02-01", vacio.getFecha_finalizacion());
		assertEquals("Terminado", vacio.getEstado_proyecto());
		assertEquals("fondo.png", vacio.getFondo());
	}

	@Test
	void tareasConstructorYSetters() {
		Tareas t = new Tareas(199, "Base de datos", "Estructura", "2024-06-13", "danger", "terminado", 197);
		assertEquals(199, t.getId_tarea());
		assertEquals("Base de datos", t.getNombre());
		assertEquals("Estructura", t.getDescripcion());
		assertEquals("2024-06-13", t.getFecha_vencimiento());
		assertEquals("danger", t.getLista());
		assertEquals("terminado", t.getEstado());
		assertEquals(197, t.getId_proyecto());

		Tareas vacia = new Tareas();
		vacia.setId_tarea(1);
		vacia.setNombre("N");
		vacia.setDescripcion("D");
		vacia.setFecha_vencimiento("2024-07-01");
		vacia.setLista("info");
		vacia.setEstado("pendiente");
		vacia.setId_proyecto(2);
		assertEquals(1, vacia.getId_tarea());
		assertEquals("N", vacia.getNombre());
		assertEquals("D", vacia.getDescripcion());
		assertEquals("2024-07-01", vacia.getFecha_vencimiento());
		assertEquals("info", vacia.getLista());
		assertEquals("pendiente", vacia.getEstado());
		assertEquals(2, vacia.getId_proyecto());
	}

	@Test
	void comentariosConstructorYSetters() {
		Comentarios c = new Comentarios(201, "Perla", 199, "Subirlo YA!!!", "2024-06-26 13:48:00");
		assertEquals(201, c.getId_comentario());
		assertEquals("Perla", c.getId_usuario());
		assertEquals(199, c.getId_tarea());
		assertEquals("Subirlo YA!!!", c.getTexto_comentario());
		assertEquals("2024-06-26 13:48:00", c.getFecha_hora());

		Comentarios vacio = new Comentarios();
		vacio.setId_comentario(3);
		vacio.setId_usuario("Liliana");
		vacio.setId_tarea(4);
		vacio.setTexto_comentario("hola");
		vacio.setFecha_hora("2024-06-26 13:49:00");
		assertEquals(3, vacio.getId_comentario());
		assertEquals("Liliana", vacio.getId_usuario());
		assertEquals(4, vacio.getId_tarea());
		assertEquals("hola", vacio.getTexto_comentario());
		assertEquals("2024-06-26 13:49:00", vacio.getFecha_hora());
	}

	@Test
	void asignacionesConstructorYSetters() {
		Asignaciones a = new Asignaciones(10, 131, 199, "2024-06-20");
		assertEquals(10, a.getId_asignacion());
		assertEquals(131, a.getId_usuario());
		assertEquals(199, a.getId_tarea());
		assertEquals("2024-06-20", a.getFecha_asignacion());

		Asignaciones vacia = new Asignaciones();
		vacia.setId_asignacion(11);
		vacia.setId_usuario(172);
		vacia.setId_tarea(200);
		vacia.setFecha_asignacion("2024-06-21");
		assertEquals(11, vacia.getId_asignacion());
		assertEquals(172, vacia.getId_usuario());
		assertEquals(200, vacia.getId_tarea());
		assertEquals("2024-06-21", vacia.getFecha_asignacion());
	}
}
