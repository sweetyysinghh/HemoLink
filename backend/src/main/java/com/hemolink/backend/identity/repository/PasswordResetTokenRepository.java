package com.hemolink.backend.identity.repository;

import com.hemolink.backend.identity.model.PasswordResetToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
	Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
