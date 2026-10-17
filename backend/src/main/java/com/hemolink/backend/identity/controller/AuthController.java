package com.hemolink.backend.identity.controller;

import com.hemolink.backend.identity.dto.AuthDtos.AuthResponse;
import com.hemolink.backend.identity.dto.AuthDtos.ForgotPasswordRequest;
import com.hemolink.backend.identity.dto.AuthDtos.LoginRequest;
import com.hemolink.backend.identity.dto.AuthDtos.RegisterRequest;
import com.hemolink.backend.identity.dto.AuthDtos.ResetPasswordRequest;
import com.hemolink.backend.identity.service.AuthService;
import com.hemolink.backend.identity.service.AuthService.IssuedTokens;
import com.hemolink.backend.identity.service.PasswordResetService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final String REFRESH_COOKIE = "hemolink_refresh";

	private final AuthService authService;
	private final PasswordResetService passwordResetService;
	private final boolean secureCookie;

	public AuthController(
				AuthService authService,
				PasswordResetService passwordResetService,
				@Value("${auth.refresh-cookie-secure}") boolean secureCookie) {
		this.authService = authService;
		this.passwordResetService = passwordResetService;
		this.secureCookie = secureCookie;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
		return issueTokens(authService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return issueTokens(authService.login(request.email(), request.password()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(
				@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
		return issueTokens(authService.refresh(refreshToken));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(
				@CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
		authService.logout(refreshToken);
		return ResponseEntity.noContent()
				.header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
				.build();
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
		passwordResetService.requestReset(request.email());
		return ResponseEntity.accepted().body(Map.of(
				"message", "If an account exists for that email, a password reset link will be sent."));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		passwordResetService.resetPassword(request.token(), request.newPassword());
		return ResponseEntity.noContent().build();
	}

	private ResponseEntity<AuthResponse> issueTokens(IssuedTokens tokens) {
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, refreshCookie(tokens).toString())
				.body(tokens.response());
	}

	private ResponseCookie refreshCookie(IssuedTokens tokens) {
		return ResponseCookie.from(REFRESH_COOKIE, tokens.refreshToken())
				.httpOnly(true)
				.secure(secureCookie)
				.path("/api/auth")
				.sameSite("Lax")
				.maxAge(tokens.refreshTokenTtl())
				.build();
	}

	private ResponseCookie clearRefreshCookie() {
		return ResponseCookie.from(REFRESH_COOKIE, "")
				.httpOnly(true)
				.secure(secureCookie)
				.path("/api/auth")
				.sameSite("Lax")
				.maxAge(0)
				.build();
	}
}
