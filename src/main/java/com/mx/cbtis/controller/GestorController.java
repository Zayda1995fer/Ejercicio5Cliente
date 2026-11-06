package com.mx.cbtis.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import com.mx.cbtis.modelo.Comentarios;
import com.mx.cbtis.modelo.Proyectos;
import com.mx.cbtis.modelo.Tareas;
import com.mx.cbtis.modelo.Usuario;

@Controller
public class GestorController {

	private static final Logger log = LoggerFactory.getLogger(GestorController.class);

	private static final String VISTA_PROYECTO = "proyecto";
	private static final String REDIRECT_INICIO = "redirect:/inicio";
	private static final String REDIRECT_PROYECTO = "redirect:/proyecto";

	// PRACTICA 3: RestTemplate inyectado (antes "new RestTemplate()" en cada metodo)
	private final RestTemplate template;

	// PRACTICA 3: URL del API configurable (antes "http://localhost:8081" repetido en cada metodo)
	private final String apiUrl;

	public GestorController(RestTemplate template, @Value("${gestor.api.url}") String apiUrl) {
		this.template = template;
		this.apiUrl = apiUrl;
	}

	private HttpHeaders jsonHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	@GetMapping("/")
	public String getHome() {
		return "home";
	}

	@GetMapping("/tutorial")
	public String getTutorial() {
		return "tutorial";
	}

	@GetMapping("/manual")
	public String getManual() {
		return "manual";
	}

	@GetMapping("/login")
	public String getLogin() {
		return "login";
	}

	@GetMapping("/register")
	public String getRegister(Model modelo) {

		Usuario usuario = new Usuario();
		modelo.addAttribute("usuario", usuario);

		return "register";
	}

	@PostMapping("/saveUsuario")
	public ModelAndView setSaveUsuario(@ModelAttribute Usuario usuario) {

		template.postForEntity(apiUrl + "/addUsuario", usuario, Integer.class);

		return new ModelAndView("redirect:/login");
	}

	@GetMapping("/inicio")
	public String getInicio(Model modelo) {

		Proyectos proyectos = new Proyectos();
		modelo.addAttribute("proyectos", proyectos);

		return "inicio";
	}

	@PostMapping("/saveProyecto")
	public ModelAndView setSaveProyecto(@ModelAttribute Proyectos proyecto) {

		template.postForEntity(apiUrl + "/addProyecto", proyecto, Integer.class);

		return new ModelAndView(REDIRECT_INICIO);
	}

	@PostMapping("/consultarProyectos")
	public ResponseEntity<Object> consultarProyectos(Model modelo) {

		Proyectos[] response = template.postForObject(apiUrl + "/buscarProyectos", jsonHeaders(), Proyectos[].class);
		List<Proyectos> proyectos = Arrays.asList(response);
		modelo.addAttribute("listaProyectos", proyectos);

		return new ResponseEntity<>(proyectos, HttpStatusCode.valueOf(200));
	}

	@PostMapping("/eliminarProyecto")
	public ModelAndView eliminarProyecto(@RequestBody Proyectos proyecto) {
		log.info("El id del proyecto es: {}", proyecto.getId_proyecto());
		HttpEntity<Proyectos> request = new HttpEntity<>(proyecto);
		template.exchange(apiUrl + "/deleteProyecto", HttpMethod.DELETE, request, Integer.class);

		return new ModelAndView(REDIRECT_INICIO);
	}

	@PostMapping("/actualizarProyecto")
	public ResponseEntity<Object> updateProyecto(@RequestBody Proyectos proyecto) {
		Map<String, Integer> params = new HashMap<>();
		params.put("id_proyecto", proyecto.getId_proyecto());
		Proyectos proyectos = template.getForObject(apiUrl + "/buscarProyecto?id_proyecto={id_proyecto}",
				Proyectos.class, params);

		return new ResponseEntity<>(proyectos, HttpStatusCode.valueOf(200));
	}

	@PostMapping("/verificarLogin")
	public ResponseEntity<Usuario> verificarUsuario(@RequestBody Usuario paramUser) {
		return template.postForEntity(apiUrl + "/getUsuarioLogin", paramUser, Usuario.class);
	}

	@PostMapping("/consultarUsuarios")
	public ResponseEntity<Object> consultarUsuarios(Model modelo) {

		Usuario[] response = template.postForObject(apiUrl + "/buscarUsuarios", jsonHeaders(), Usuario[].class);
		List<Usuario> usuarios = Arrays.asList(response);
		modelo.addAttribute("listaUsuarios", usuarios);

		return new ResponseEntity<>(usuarios, HttpStatusCode.valueOf(200));
	}

	@PostMapping("/obtenerTareas")
	public ResponseEntity<List<Tareas>> obtenerTareas(@RequestBody Tareas idProyecto, Model modelo) {
		Tareas[] response = template.postForObject(apiUrl + "/getTarea", idProyecto, Tareas[].class);
		List<Tareas> listaTareas = Arrays.asList(response);
		modelo.addAttribute("tareas", listaTareas);
		return ResponseEntity.ok(listaTareas);
	}

	@PostMapping("/obtenerComentarios")
	public ResponseEntity<List<Comentarios>> obtenerComentarios(@RequestBody Comentarios idComentario, Model modelo) {
		Comentarios[] response = template.postForObject(apiUrl + "/getComentario", idComentario, Comentarios[].class);
		List<Comentarios> listaComentarios = Arrays.asList(response);
		modelo.addAttribute("comentarios", listaComentarios);
		return ResponseEntity.ok(listaComentarios);
	}

	//Liliana
	@GetMapping("/proyecto")
	public String getProyecto(Model modelo) {
		Tareas tarea = new Tareas();
		modelo.addAttribute("tarea", tarea);

		Comentarios comentario = new Comentarios();
		modelo.addAttribute("comentarios", comentario);

		Usuario[] responseUsuario = template.postForObject(apiUrl + "/buscarUsuarios", jsonHeaders(), Usuario[].class);
		List<Usuario> usuarios = Arrays.asList(responseUsuario);
		modelo.addAttribute("listaUsuarios", usuarios);

		return VISTA_PROYECTO;
	}

	@GetMapping("/tarea")
	public String getTarea(Model modelo) {
		Tareas tareas = new Tareas();
		modelo.addAttribute("tareas", tareas);

		return VISTA_PROYECTO;
	}

	@PostMapping("/saveTarea")
	public ModelAndView setSaveTareas(@ModelAttribute Tareas tareas) {

		template.postForEntity(apiUrl + "/addTareas", tareas, Integer.class);
		ModelAndView mav = new ModelAndView(REDIRECT_PROYECTO);
		mav.addObject("id_proyecto", tareas.getId_proyecto());

		return mav;
	}

	@PostMapping("/saveComentario")
	public String setSaveComentario(@RequestBody Comentarios comentarios) {

		template.postForEntity(apiUrl + "/addComentario", comentarios, Integer.class);

		return VISTA_PROYECTO;
	}

	@PostMapping("/actualizarTarea")
	public ResponseEntity<Object> updateTarea(@RequestBody Tareas tarea) {
		Map<String, Integer> params = new HashMap<>();
		params.put("id_tarea", tarea.getId_tarea());
		Tareas tareas = template.getForObject(apiUrl + "/buscarTarea?id_tarea={id_tarea}", Tareas.class, params);

		return new ResponseEntity<>(tareas, HttpStatusCode.valueOf(200));
	}

	@PostMapping("/eliminarTarea")
	public ModelAndView eliminarTarea(@RequestBody Tareas tareas) {
		log.info("El id de la tarea es: {}", tareas.getId_tarea());
		HttpEntity<Tareas> request = new HttpEntity<>(tareas);
		template.exchange(apiUrl + "/deleteTareas", HttpMethod.DELETE, request, Integer.class);

		return new ModelAndView(REDIRECT_PROYECTO);
	}

	@PostMapping("/verificarTarea")
	public ResponseEntity<Integer> verificarTarea(@RequestBody Tareas paramName) {
		return template.postForEntity(apiUrl + "/addTareas", paramName, Integer.class);
	}

	@PostMapping("/cambiosTareas")
	public ResponseEntity<Integer> cambiosTareas(@RequestBody Tareas paramDatos) {
		return template.postForEntity(apiUrl + "/addTareas", paramDatos, Integer.class);
	}

	@PostMapping("/consultarTareas")
	public ResponseEntity<Object> consultarTareas() {
		Tareas[] response = template.postForObject(apiUrl + "/buscarTareas", jsonHeaders(), Tareas[].class);
		List<Tareas> tareas = Arrays.asList(response);

		return new ResponseEntity<>(tareas, HttpStatusCode.valueOf(200));
	}

	@PostMapping("/consultarComentarios")
	public ResponseEntity<Object> consultarComentarios() {
		Comentarios[] response = template.postForObject(apiUrl + "/buscarComentarios", jsonHeaders(),
				Comentarios[].class);
		List<Comentarios> comentarios = Arrays.asList(response);

		return new ResponseEntity<>(comentarios, HttpStatusCode.valueOf(200));
	}
}
