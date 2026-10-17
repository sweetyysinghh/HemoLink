package com.hemolink.backend.identity.service;

import com.hemolink.backend.identity.model.User;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

	private final JwtEncoder jwtEncoder;
	private final Duration accessTokenTtl;

	public JwtTokenService(
				JwtEncoder jwtEncoder,
				@Value("${security.jwt.access-token-ttl}") Duration accessTokenTtl) {
		this.jwtEncoder = jwtEncoder;
		this.accessTokenTtl = accessTokenTtl;
	}

	public String createAccessToken(User user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("hemolink")
				.issuedAt(now)
				.expiresAt(now.plus(accessTokenTtl))
				.subject(user.getId().toString())
				.claim("email", user.getEmail())
				.claim("roles", List.of(user.getRole().getName().name()))
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public Duration getAccessTokenTtl() {
		return accessTokenTtl;
	}
}
