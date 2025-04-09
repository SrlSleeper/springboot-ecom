package com.appdev.set.event;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.appdev.set.model.user.User;

@Component
public class PasswordResetEventListener implements ApplicationListener<OnPasswordResetEvent> {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.base.url}")
    private String baseUrl;

    public PasswordResetEventListener(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Override
    public void onApplicationEvent(OnPasswordResetEvent event) {
        try {
            User user = event.getUser();
            String token = event.getToken();
            String resetLink = baseUrl + "/reset-password?token=" + token;

            // Prepare HTML email content
            Context context = new Context();
            context.setVariable("resetLink", resetLink);
            String htmlContent = templateEngine.process("email/password-reset-template", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(user.getEmail());
            helper.setSubject("Reset Your Password");
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
