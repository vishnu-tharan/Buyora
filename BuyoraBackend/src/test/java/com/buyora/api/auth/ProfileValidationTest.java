package com.buyora.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.buyora.api.user.UpdateProfileRequest;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

class ProfileValidationTest {
  @Test
  void optionalPhoneCanBeOmittedOrCleared() {
    try (var factory = Validation.buildDefaultValidatorFactory()) {
      for (String phone : new String[] {null, "", "   ", "0771234567"}) {
        var request = new UpdateProfileRequest("Test", "Customer", phone);
        assertThat(factory.getValidator().validate(request)).isEmpty();
      }
      assertThat(new UpdateProfileRequest("Test", "Customer", "   ").phone()).isNull();
    }
  }

  @Test
  void invalidPhoneIsStillRejected() {
    try (var factory = Validation.buildDefaultValidatorFactory()) {
      var request = new UpdateProfileRequest("Test", "Customer", "invalid-number");
      assertThat(factory.getValidator().validate(request)).isNotEmpty();
    }
  }
}
