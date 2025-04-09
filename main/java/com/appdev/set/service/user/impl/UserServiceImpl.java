package com.appdev.set.service.user.impl;

import com.appdev.set.model.user.User;
import com.appdev.set.service.email.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class UserServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${app.url}")
    private String appUrl;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    public UserServiceImpl(JavaMailSender mailSender, TemplateEngine templateEngine) {
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
            
            logger.info("Sending verification email to: {}", user.getEmail());
            mailSender.send(mimeMessage);
            logger.info("Verification email sent successfully to: {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send verification email to: {}", user.getEmail(), e);
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
            
            logger.info("Sending password reset email to: {}", user.getEmail());
            mailSender.send(mimeMessage);
            logger.info("Password reset email sent successfully to: {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to: {}", user.getEmail(), e);
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
            
            logger.info("Sending order confirmation email to: {}", user.getEmail());
            mailSender.send(mimeMessage);
            logger.info("Order confirmation email sent successfully to: {}", user.getEmail());
        } catch (MessagingException e) {
            logger.error("Failed to send order confirmation email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }
}
