package com.hemolink.backend.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ProblemDetail> handleInvalidArguments(
				MethodArgumentNotValidException exception, HttpServletRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors().forEach(error ->
				errors.put(error.getField(), error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage()));

		return problem(HttpStatus.BAD_REQUEST, "Validation failed",
				"One or more request fields are invalid.", request, errors);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ProblemDetail> handleConstraintViolations(
				ConstraintViolationException exception, HttpServletRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
			errors.put(violation.getPropertyPath().toString(), violation.getMessage());
		}

		return problem(HttpStatus.BAD_REQUEST, "Validation failed",
				"One or more values are invalid.", request, errors);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ProblemDetail> handleUnreadableMessage(
				HttpMessageNotReadableException exception, HttpServletRequest request) {
		return problem(HttpStatus.BAD_REQUEST, "Malformed request",
				"The request body could not be read.", request, null);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ProblemDetail> handleResponseStatus(
				ResponseStatusException exception, HttpServletRequest request) {
		String detail = exception.getReason() == null
				? "The request could not be completed."
				: exception.getReason();
		return problem(exception.getStatusCode(), "Request failed", detail, request, null);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ProblemDetail> handleUnexpected(
				Exception exception, HttpServletRequest request) {
		logger.error("Unhandled exception for {} {}", request.getMethod(), request.getRequestURI(), exception);
		return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
				"An unexpected error occurred.", request, null);
	}

	private ResponseEntity<ProblemDetail> problem(
				HttpStatusCode status,
				String title,
				String detail,
				HttpServletRequest request,
				Map<String, String> errors) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setTitle(title);
		problem.setInstance(URI.create(request.getRequestURI()));
		if (errors != null && !errors.isEmpty()) {
			problem.setProperty("errors", errors);
		}
		return ResponseEntity.status(status).body(problem);
	}
}