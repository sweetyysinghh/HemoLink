package com.hemolink.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@OpenAPIDefinition(
		info = @Info(
				title = "HemoLink API",
				version = "0.1.0",
				description = "API for HemoLink donor and hospital coordination."
		)
)
public class OpenApiConfig {
}