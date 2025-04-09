package com.appdev.set.service.email;

import com.appdev.set.model.user.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);
    void sendPasswordResetEmail(User user, String token);
    void sendOrderConfirmationEmail(User user, Long orderId);
}

