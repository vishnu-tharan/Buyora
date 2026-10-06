package com.buyora.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.buyora.api.auth.dto.*;
import com.buyora.api.common.AbstractIntegrationTest;
import com.buyora.api.notification.service.NotificationService;
import com.buyora.api.user.entity.UserStatus;
import com.buyora.api.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIT extends AbstractIntegrationTest {
  @Autowired TestRestTemplate restTemplate;
  @Autowired UserRepository users;
  @MockitoBean NotificationService notifications;

  record Csrf(String token, String headerName) {}

  HttpHeaders csrfHeaders() {
    var response = restTemplate.getForEntity("/api/v1/auth/csrf", Csrf.class);
    HttpHeaders headers = new HttpHeaders();
    headers.set(response.getBody().headerName(), response.getBody().token());
    headers.set(
        HttpHeaders.COOKIE,
        response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).split(";", 2)[0]);
    return headers;
  }

  @Test
  void shouldRegisterAndLoginWithVerifiedAccount() {
    var request =
        new RegisterRequest("test@example.com", "Password123!", "Test", "User", "0112345678");
    var registered =
        restTemplate.postForEntity(
            "/api/v1/auth/register", new HttpEntity<>(request, csrfHeaders()), AuthResponse.class);
    assertThat(registered.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    var user = users.findByEmail(request.email()).orElseThrow();
    user.setEmailVerified(true);
    user.setStatus(UserStatus.ACTIVE);
    users.save(user);
    var login =
        restTemplate.postForEntity(
            "/api/v1/auth/login",
            new HttpEntity<>(new LoginRequest(request.email(), request.password()), csrfHeaders()),
            AuthResponse.class);
    assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
    HttpHeaders headers = new HttpHeaders();
    headers.set(
        HttpHeaders.COOKIE, login.getHeaders().getFirst(HttpHeaders.SET_COOKIE).split(";", 2)[0]);
    assertThat(
            restTemplate
                .exchange(
                    "/api/v1/account/profile",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class)
                .getStatusCode())
        .isEqualTo(HttpStatus.OK);
  }

  @Test
  void shouldRejectInvalidLogin() {
    var response =
        restTemplate.postForEntity(
            "/api/v1/auth/login",
            new HttpEntity<>(new LoginRequest("wrong@example.com", "wrongpass"), csrfHeaders()),
            String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  void shouldRejectMutationWithoutCsrf() {
    var response =
        restTemplate.postForEntity(
            "/api/v1/auth/login",
            new LoginRequest("test@example.com", "Password123!"),
            String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
  }

  @Test
  void shouldDenyAccessWithoutAuth() {
    assertThat(restTemplate.getForEntity("/api/v1/account/profile", String.class).getStatusCode())
        .isEqualTo(HttpStatus.UNAUTHORIZED);
  }
}
