package com.buyora.api.common.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Generates cryptographically secure tokens.
 * Used for: refresh tokens, email verification, password reset, cart IDs.
 */
@Component
public class SecureTokenGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    /** Generate a URL-safe base64 token of the given byte length. */
    public String generate(int byteLength) {
        byte[] bytes = new byte[byteLength];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Standard 32-byte (256-bit) token. */
    public String generate() {
        return generate(32);
    }

    /** Short token for cart identifiers (16 bytes). */
    public String generateShort() {
        return generate(16);
    }
}
