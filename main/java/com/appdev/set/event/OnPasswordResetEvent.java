package com.appdev.set.event;

import org.springframework.context.ApplicationEvent;

import com.appdev.set.model.user.User;

public class OnPasswordResetEvent extends ApplicationEvent {
    private static final long serialVersionUID = 1L;

    private final User user;
    private final String token;

    public OnPasswordResetEvent(User user, String token) {
        super(user);
        this.user = user;
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public String getToken() {
        return token;
    }
}
