package com.alumni.platform.identity.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class PasswordChangedEvent extends ApplicationEvent {

    private final UUID userId;

    public PasswordChangedEvent(Object source, UUID userId) {
        super(source);
        this.userId = userId;
    }
}