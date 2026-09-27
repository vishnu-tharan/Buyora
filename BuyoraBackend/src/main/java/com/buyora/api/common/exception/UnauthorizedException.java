package com.buyora.api.common.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends BuyoraException {
    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message, HttpStatus.UNAUTHORIZED);
    }
}
