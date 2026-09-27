package com.buyora.api.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base application exception. Subclass for specific domain exceptions.
 */
@Getter
public class BuyoraException extends RuntimeException {

    private final String code;
    private final HttpStatus status;

    public BuyoraException(String code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public BuyoraException(String code, String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.status = status;
    }
}
