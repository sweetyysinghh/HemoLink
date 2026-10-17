package com.hemolink.backend.identity.service;

import com.hemolink.backend.identity.dto.AuthDtos.AuthResponse;
import com.hemolink.backend.identity.dto.AuthDtos.RegisterRequest;
import com.hemolink.backend.identity.dto.AuthDtos.UserView;
import com.hemolink.backend.identity.model.RefreshToken;
import com.hemolink.backend.identity.model.Role;
import com.hemolink.backend.identity.model.RoleName;
import com.hemolink.backend.identity.model.User;
import com.hemolink.backend.identity.repository.RefreshTokenRepository;
import com.hemolink.backend.identity.repository.RoleRepository;
import com.hemolink.backend.identity.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final OpaqueTokenService opaqueTokenService;
	private final JwtTokenService jwtTokenService;
	private final Duration refreshTokenTtl;

	public AuthService(
				UserRepository userRepository,
				RoleRepository roleRepository,
				RefreshTokenRepository refreshTokenRepository,
				PasswordEncoder passwordEncoder,
				OpaqueTokenService opaqueTokenService,
				JwtTokenService jwtTokenService,
				@Value("${security.jwt.refresh-token-ttl}") Duration refreshTokenTtl) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.opaqueTokenService = opaqueTokenService;
		this.jwtTokenService = jwtTokenService;
		this.refreshTokenTtl = refreshTokenTtl;
	}

	@Transactional
	public IssuedTokens register(RegisterRequest request) {
		if (request.role() == RoleName.ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin accounts cannot register publicly.");
		}
		if (request.role() == RoleName.DONOR
				&& (isBlank(request.city()) || isBlank(request.bloodType()))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donor registration requires city and blood type.");
		}
		if (request.role() == RoleName.HOSPITAL
				&& (isBlank(request.city()) || isBlank(request.organizationName()))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hospital registration requires organization and city.");
		}

		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with that email already exists.");
		}

		Role role = roleRepository.findByName(request.role())
				.orElseThrow(() -> new IllegalStateException("Required account role is not seeded: " + request.role()));
		User user = userRepository.saveAndFlush(new User(
				email,
				passwordEncoder.encode(request.password()),
				request.fullName().trim(),
				normalizeOptional(request.phone()),
				normalizeOptional(request.organizationName()),
				normalizeOptional(request.city()),
				normalizeOptional(request.bloodType()),
				role));
		return issueTokens(user);
	}

	@Transactional
	public IssuedTokens login(String emailInput, String password) {
		String email = normalizeEmail(emailInput);
		User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
		if (user == null || !user.isEnabled() || !passwordEncoder.matches(password, user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
		}
		return issueTokens(user);
	}

	@Transactional
	public IssuedTokens refresh(String rawRefreshToken) {
		if (isBlank(rawRefreshToken)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing or invalid.");
		}
		String tokenHash = opaqueTokenService.hash(rawRefreshToken);
		RefreshToken current = refreshTokenRepository.findByTokenHash(tokenHash)
				.filter(token -> token.getRevokedAt() == null && token.getExpiresAt().isAfter(Instant.now()))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing or invalid."));

		current.revoke();
		return issueTokens(current.getUser());
	}

	@Transactional
	public void logout(String rawRefreshToken) {
		if (isBlank(rawRefreshToken)) {
			return;
		}
		RefreshToken token = refreshTokenRepository.findByTokenHash(opaqueTokenService.hash(rawRefreshToken)).orElse(null);
		if (token != null) {
			token.revoke();
		}
	}

	private IssuedTokens issueTokens(User user) {
		String refreshToken = opaqueTokenService.generate();
		refreshTokenRepository.save(new RefreshToken(
				user,
				opaqueTokenService.hash(refreshToken),
				Instant.now().plus(refreshTokenTtl)));

		AuthResponse response = new AuthResponse(
				jwtTokenService.createAccessToken(user),
				"Bearer",
				jwtTokenService.getAccessTokenTtl().toSeconds(),
				new UserView(user.getId(), user.getEmail(), user.getFullName(), user.getRole().getName()));
		return new IssuedTokens(response, refreshToken, refreshTokenTtl);
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String normalizeOptional(String value) {
		return isBlank(value) ? null : value.trim();
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}

	public record IssuedTokens(AuthResponse response, String refreshToken, Duration refreshTokenTtl) {
	}
}
