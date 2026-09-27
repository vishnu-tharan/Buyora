package com.buyora.api.common.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends BuyoraException {
    public ForbiddenException(String message) {
        super("FORBIDDEN", message, HttpStatus.FORBIDDEN);
    }
}
