package com.buyora.api.auth;
import com.buyora.api.common.config.SecurityBeansConfig;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class PasswordHashTest {
    @Test void argon2CanHashAndVerifyPasswords() {
        var encoder = new SecurityBeansConfig().passwordEncoder();
        String hash = encoder.encode("Correct-Horse-9!");
        assertThat(hash).startsWith("$argon2id$");
        assertThat(encoder.matches("Correct-Horse-9!", hash)).isTrue();
        assertThat(encoder.matches("wrong", hash)).isFalse();
    }
}
