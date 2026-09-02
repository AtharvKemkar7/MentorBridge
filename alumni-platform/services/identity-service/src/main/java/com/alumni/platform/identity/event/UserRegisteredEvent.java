package com.alumni.platform.identity.event;

import com.alumni.platform.identity.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class UserRegisteredEvent extends ApplicationEvent {

    private final UUID userId;
    private final String email;
    private final User.UserType userType;

    public UserRegisteredEvent(Object source, UUID userId, String email, User.UserType userType) {
        super(source);
        this.userId = userId;
        this.email = email;
        this.userType = userType;
    }
}