package io.fleetos.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.from:noreply@fleetos.io}")
    private String fromAddress;

    @Value("${app.name:FleetOS}")
    private String appName;

    // ----------------------------------------------------------------
    // Password Reset OTP
    // ----------------------------------------------------------------
    @Async
    public void sendPasswordResetOtp(String toEmail, String fullName, String otp) {
        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("otp", otp);
        ctx.setVariable("appName", appName);
        ctx.setVariable("expiryMinutes", 10);

        sendHtmlEmail(toEmail, appName + " – Password Reset OTP",
            "email/otp", ctx);
    }

    // ----------------------------------------------------------------
    // Email Verification OTP
    // ----------------------------------------------------------------
    @Async
    public void sendEmailVerificationOtp(String toEmail, String fullName, String otp) {
        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("otp", otp);
        ctx.setVariable("appName", appName);
        ctx.setVariable("expiryMinutes", 10);

        sendHtmlEmail(toEmail, "Verify your " + appName + " email",
            "email/otp", ctx);
    }

    // ----------------------------------------------------------------
    // Core send method
    // ----------------------------------------------------------------
    private void sendHtmlEmail(String to, String subject, String template, Context ctx) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);

            String html = templateEngine.process(template, ctx);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Email sent to {} – subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}
