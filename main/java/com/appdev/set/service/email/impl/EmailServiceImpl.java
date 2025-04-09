package com.appdev.set.service.email.impl;

import com.appdev.set.model.user.User;
import com.appdev.set.service.email.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${app.url}")
    private String appUrl;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void sendVerificationEmail(User user, String token) {
        try {
            String verificationUrl = appUrl + "/auth/verify-email?token=" + token;
            
            Context context = new Context();
            context.setVariable("name", user.getFirstName());
            context.setVariable("verificationUrl", verificationUrl);
            
            String emailContent = templateEngine.process("email/verification-email", context);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Please verify your email address");
            helper.setText(emailContent, true);
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = appUrl + "/auth/reset-password?token=" + token;
            
            Context context = new Context();
            context.setVariable("name", user.getFirstName());
            context.setVariable("resetUrl", resetUrl);
            
            String emailContent = templateEngine.process("email/password-reset-email", context);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request");
            helper.setText(emailContent, true);
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendOrderConfirmationEmail(User user, Long orderId) {
        try {
            String orderUrl = appUrl + "/orders/" + orderId;
            
            Context context = new Context();
            context.setVariable("name", user.getFirstName());
            context.setVariable("orderId", orderId);
            context.setVariable("orderUrl", orderUrl);
            
            String emailContent = templateEngine.process("email/order-confirmation-email", context);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Order Confirmation #" + orderId);
            helper.setText(emailContent, true);
            
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }
}
