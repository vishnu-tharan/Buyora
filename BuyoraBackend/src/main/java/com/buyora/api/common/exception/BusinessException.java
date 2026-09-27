package com.buyora.api.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends BuyoraException {
    public BusinessException(String code, String message) {
        super(code, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
