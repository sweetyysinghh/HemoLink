package com.hemolink.backend.identity.service;

import com.hemolink.backend.identity.model.Role;
import com.hemolink.backend.identity.model.RoleName;
import com.hemolink.backend.identity.model.User;
import com.hemolink.backend.identity.repository.RoleRepository;
import com.hemolink.backend.identity.repository.UserRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InitialAdminProvisioner implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(InitialAdminProvisioner.class);

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final String email;
	private final String password;
	private final String fullName;

	public InitialAdminProvisioner(
				UserRepository userRepository,
				RoleRepository roleRepository,
				PasswordEncoder passwordEncoder,
				@Value("${APP_ADMIN_EMAIL:}") String email,
				@Value("${APP_ADMIN_PASSWORD:}") String password,
				@Value("${APP_ADMIN_FULL_NAME:}") String fullName) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.email = email;
		this.password = password;
		this.fullName = fullName;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (email.isBlank() && password.isBlank() && fullName.isBlank()) {
			return;
		}
		if (email.isBlank() || password.length() < 12 || fullName.isBlank()) {
			throw new IllegalStateException("Initial admin provisioning requires APP_ADMIN_EMAIL, APP_ADMIN_FULL_NAME, and an APP_ADMIN_PASSWORD of at least 12 characters.");
		}

		String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
		User existingUser = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
		if (existingUser != null) {
			if (existingUser.getRole().getName() == RoleName.ADMIN) {
				logger.info("Initial admin account is already provisioned.");
				return;
			}
			throw new IllegalStateException("APP_ADMIN_EMAIL belongs to a non-admin account; refusing to change its role.");
		}

		Role adminRole = roleRepository.findByName(RoleName.ADMIN)
				.orElseThrow(() -> new IllegalStateException("ADMIN role is missing from the roles table."));
		userRepository.save(new User(
				normalizedEmail,
				passwordEncoder.encode(password),
				fullName.trim(),
				null,
				null,
				null,
				null,
				adminRole));
		logger.info("Initial admin account provisioned.");
	}
}
