package com.mx.cbtis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * PRACTICA 3: un solo RestTemplate administrado por Spring.
 * Antes cada metodo del controlador hacia "new RestTemplate()", lo que impedia
 * interceptar las llamadas al API en las pruebas (MockRestServiceServer).
 */
@Configuration
public class RestClientConfig {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}
