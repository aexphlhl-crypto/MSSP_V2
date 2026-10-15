package com.mspportal.integrationcore.exception;

import com.mspportal.integrationcore.enums.AuthorizationReason;
import lombok.Getter;

@Getter
public class ProviderAuthorizationException extends RuntimeException {
    private final AuthorizationReason reason;

    public ProviderAuthorizationException(AuthorizationReason reason, String message) {
        super(message);
        this.reason = reason;
    }
}
