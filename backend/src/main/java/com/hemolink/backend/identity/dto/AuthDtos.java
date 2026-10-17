package com.hemolink.backend.identity.dto;

import com.hemolink.backend.identity.model.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {

	private AuthDtos() {
	}

	public record RegisterRequest(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(min = 8, max = 72) String password,
			@NotBlank @Size(max = 120) String fullName,
			@Size(max = 32) String phone,
			@Size(max = 160) String organizationName,
			@Size(max = 120) String city,
			@Pattern(regexp = "A[+-]|B[+-]|AB[+-]|O[+-]", message = "Select a valid blood type") String bloodType,
			@NotNull RoleName role) {
	}

	public record LoginRequest(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(max = 72) String password) {
	}

	public record ForgotPasswordRequest(
			@NotBlank @Email @Size(max = 254) String email) {
	}

	public record ResetPasswordRequest(
			@NotBlank String token,
			@NotBlank @Size(min = 8, max = 72) String newPassword) {
	}

	public record UserView(UUID id, String email, String fullName, RoleName role) {
	}

	public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserView user) {
	}
}
