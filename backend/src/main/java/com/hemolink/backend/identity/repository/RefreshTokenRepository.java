package com.hemolink.backend.identity.repository;

import com.hemolink.backend.identity.model.RefreshToken;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
	Optional<RefreshToken> findByTokenHash(String tokenHash);
	List<RefreshToken> findAllByUser_IdAndRevokedAtIsNull(UUID userId);
}
