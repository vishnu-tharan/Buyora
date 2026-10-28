package com.buyora.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.buyora.api.common.AbstractIntegrationTest;
import com.buyora.api.user.UserRepository;
import com.buyora.api.user.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIT extends AbstractIntegrationTest {
  @Autowired TestRestTemplate restTemplate;
  @Autowired UserRepository users;

  @Test
  void missingPublicEndpointReturnsNotFound() {
    assertThat(
            restTemplate
                .getForEntity("/api/v1/products/missing/path", String.class)
                .getStatusCode())
        .isEqualTo(HttpStatus.NOT_FOUND);
  }

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
  void shouldRegisterAndLoginImmediately() {
    var request =
        new RegisterRequest("test@example.com", "Password123!", "Test", "User", "0112345678");
    var registered =
        restTemplate.postForEntity(
            "/api/v1/auth/register", new HttpEntity<>(request, csrfHeaders()), AuthResponse.class);
    assertThat(registered.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    var user = users.findByEmail(request.email()).orElseThrow();
    assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
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
    assertThat(
            restTemplate
                .exchange(
                    "/api/v1/admin/products",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class)
                .getStatusCode())
        .isEqualTo(HttpStatus.FORBIDDEN);
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
  void shouldRegisterWithoutAnOptionalPhone() {
    for (int index = 0; index < 4; index++) {
      String email = "optional-phone-" + index + "@example.test";
      var request = new java.util.HashMap<String, Object>();
      request.put("email", email);
      request.put("password", "Password123!");
      request.put("firstName", "Demo");
      request.put("lastName", "Customer");
      if (index == 1) request.put("phone", null);
      if (index == 2) request.put("phone", "");
      if (index == 3) request.put("phone", "   ");

      var response =
          restTemplate.postForEntity(
              "/api/v1/auth/register", new HttpEntity<>(request, csrfHeaders()), AuthResponse.class);

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
      var user = users.findByEmail(email).orElseThrow();
      assertThat(user.getPhone()).isNull();
      assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }
  }

  @Test
  void shouldRejectMalformedPhoneDuringRegistration() {
    var request =
        new RegisterRequest(
            "invalid-phone@example.test", "Password123!", "Demo", "Customer", "invalid");

    var response =
        restTemplate.postForEntity(
            "/api/v1/auth/register", new HttpEntity<>(request, csrfHeaders()), String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(users.findByEmail(request.email())).isEmpty();
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
