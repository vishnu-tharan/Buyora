package com.buyora.api.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends BuyoraException {
    public ConflictException(String code, String message) {
        super(code, message, HttpStatus.CONFLICT);
    }
}
