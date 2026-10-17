package com.hemolink.backend.identity;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hemolink.backend.identity.repository.RefreshTokenRepository;
import com.hemolink.backend.identity.repository.UserRepository;
import com.hemolink.backend.identity.dto.AuthDtos.AuthResponse;
import jakarta.servlet.http.Cookie;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import tools.jackson.databind.ObjectMapper;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.mockito.ArgumentCaptor;

import static org.mockito.Mockito.verify;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RefreshTokenRepository refreshTokenRepository;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private JavaMailSender mailSender;

	@BeforeEach
	void clearAccounts() {
		refreshTokenRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	void donorCanRegisterLoginAndRotateRefreshToken() throws Exception {
		MvcResult registration = mockMvc.perform(post("/api/auth/register")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"donor@example.test","password":"StrongPass123","fullName":"Test Donor","city":"Bengaluru","bloodType":"O+","role":"DONOR"}
							"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.user.role").value("DONOR"))
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(cookie().exists("hemolink_refresh"))
				.andReturn();

		String originalRefreshToken = registration.getResponse().getCookie("hemolink_refresh").getValue();
		String donorAccessToken = objectMapper.readValue(
				registration.getResponse().getContentAsString(), AuthResponse.class).accessToken();
		mockMvc.perform(get("/api/admin/probe")
					.header(HttpHeaders.AUTHORIZATION, "Bearer " + donorAccessToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/auth/login")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"DONOR@example.test","password":"StrongPass123"}
							"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.user.email").value("donor@example.test"));

		MvcResult refresh = mockMvc.perform(post("/api/auth/refresh")
					.cookie(new Cookie("hemolink_refresh", originalRefreshToken)))
				.andExpect(status().isOk())
				.andExpect(cookie().exists("hemolink_refresh"))
				.andReturn();

		String rotatedRefreshToken = refresh.getResponse().getCookie("hemolink_refresh").getValue();
		mockMvc.perform(post("/api/auth/refresh")
					.cookie(new Cookie("hemolink_refresh", originalRefreshToken)))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/auth/logout")
					.cookie(new Cookie("hemolink_refresh", rotatedRefreshToken)))
				.andExpect(status().isNoContent())
				.andExpect(cookie().maxAge("hemolink_refresh", 0));
	}

	@Test
	void publicRegistrationCannotCreateAdmin() throws Exception {
		mockMvc.perform(post("/api/auth/register")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"admin@example.test","password":"StrongPass123","fullName":"Public Admin","role":"ADMIN"}
							"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void protectedRoutesRequireAccessToken() throws Exception {
		mockMvc.perform(get("/api/private/probe"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void passwordResetChangesPasswordAndRevokesExistingRefreshTokens() throws Exception {
		MvcResult registration = mockMvc.perform(post("/api/auth/register")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"reset@example.test","password":"OriginalPass123","fullName":"Reset User","city":"Bengaluru","bloodType":"A+","role":"DONOR"}
							"""))
				.andExpect(status().isOk())
				.andReturn();
		String oldRefreshToken = registration.getResponse().getCookie("hemolink_refresh").getValue();

		mockMvc.perform(post("/api/auth/forgot-password")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"reset@example.test"}
							"""))
				.andExpect(status().isAccepted())
				.andExpect(jsonPath("$.message").value("If an account exists for that email, a password reset link will be sent."));

		ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
		verify(mailSender).send(messageCaptor.capture());
		Matcher tokenMatcher = Pattern.compile("/reset-password\\?token=([^\\s]+)")
				.matcher(messageCaptor.getValue().getText());
		Assertions.assertTrue(tokenMatcher.find());
		String resetToken = tokenMatcher.group(1);

		mockMvc.perform(post("/api/auth/reset-password")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"token":"%s","newPassword":"UpdatedPass123"}
							""".formatted(resetToken)))
				.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/auth/login")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"reset@example.test","password":"OriginalPass123"}
							"""))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/auth/login")
					.contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"email":"reset@example.test","password":"UpdatedPass123"}
							"""))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/auth/refresh")
					.cookie(new Cookie("hemolink_refresh", oldRefreshToken)))
				.andExpect(status().isUnauthorized());
	}
}
