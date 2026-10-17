package com.hemolink.backend.identity.service;

import com.hemolink.backend.identity.model.PasswordResetToken;
import com.hemolink.backend.identity.model.RefreshToken;
import com.hemolink.backend.identity.model.User;
import com.hemolink.backend.identity.repository.PasswordResetTokenRepository;
import com.hemolink.backend.identity.repository.RefreshTokenRepository;
import com.hemolink.backend.identity.repository.UserRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {

	private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

	private final UserRepository userRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final OpaqueTokenService opaqueTokenService;
	private final PasswordEncoder passwordEncoder;
	private final JavaMailSender mailSender;
	private final Duration resetTokenTtl;
	private final String frontendUrl;
	private final String fromAddress;

	public PasswordResetService(
				UserRepository userRepository,
				PasswordResetTokenRepository passwordResetTokenRepository,
				RefreshTokenRepository refreshTokenRepository,
				OpaqueTokenService opaqueTokenService,
				PasswordEncoder passwordEncoder,
				JavaMailSender mailSender,
				@Value("${auth.password-reset-ttl}") Duration resetTokenTtl,
				@Value("${app.frontend-url}") String frontendUrl,
				@Value("${MAIL_FROM:no-reply@hemolink.local}") String fromAddress) {
		this.userRepository = userRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.opaqueTokenService = opaqueTokenService;
		this.passwordEncoder = passwordEncoder;
		this.mailSender = mailSender;
		this.resetTokenTtl = resetTokenTtl;
		this.frontendUrl = frontendUrl;
		this.fromAddress = fromAddress;
	}

	@Transactional
	public void requestReset(String emailInput) {
		String email = emailInput.trim().toLowerCase(Locale.ROOT);
		User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
		if (user == null || !user.isEnabled()) {
			return;
		}

		String token = opaqueTokenService.generate();
		passwordResetTokenRepository.save(new PasswordResetToken(
				user,
				opaqueTokenService.hash(token),
				Instant.now().plus(resetTokenTtl)));

		String resetUrl = frontendUrl + "/reset-password?token="
				+ URLEncoder.encode(token, StandardCharsets.UTF_8);
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromAddress);
		message.setTo(user.getEmail());
		message.setSubject("Reset your HemoLink password");
		message.setText("Use this one-time link to reset your HemoLink password. It expires in 30 minutes:\n\n"
				+ resetUrl + "\n\nIf you did not request this, you can ignore this email.");
		try {
			mailSender.send(message);
		} catch (MailException exception) {
			logger.error("Password reset email could not be sent.", exception);
		}
	}

	@Transactional
	public void resetPassword(String rawToken, String newPassword) {
		if (rawToken == null || rawToken.isBlank()) {
			throw invalidToken();
		}
		PasswordResetToken token = passwordResetTokenRepository
				.findByTokenHash(opaqueTokenService.hash(rawToken))
				.filter(candidate -> candidate.getUsedAt() == null)
				.filter(candidate -> candidate.getExpiresAt().isAfter(Instant.now()))
				.orElseThrow(PasswordResetService::invalidToken);

		User user = token.getUser();
		user.changePasswordHash(passwordEncoder.encode(newPassword));
		token.markUsed();
		for (RefreshToken refreshToken : refreshTokenRepository.findAllByUser_IdAndRevokedAtIsNull(user.getId())) {
			refreshToken.revoke();
		}
	}

	private static ResponseStatusException invalidToken() {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset link is invalid or expired.");
	}
}
