package io.fleetos.service;

import io.fleetos.entity.OtpToken;
import io.fleetos.entity.User;
import io.fleetos.enums.OtpType;
import io.fleetos.exception.BadRequestException;
import io.fleetos.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService        emailService;

    @Value("${otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    // ----------------------------------------------------------------
    // Generate and send OTP
    // ----------------------------------------------------------------
    @Transactional
    public void sendOtp(User user, OtpType type) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        OtpToken otp = OtpToken.builder()
            .user(user)
            .token(code)
            .type(type)
            .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
            .used(false)
            .build();

        otpTokenRepository.save(otp);
        log.debug("OTP generated for user {} type {}", user.getEmail(), type);

        // Async email dispatch
        switch (type) {
            case PASSWORD_RESET      -> emailService.sendPasswordResetOtp(user.getEmail(), user.getFullName(), code);
            case EMAIL_VERIFICATION  -> emailService.sendEmailVerificationOtp(user.getEmail(), user.getFullName(), code);
        }
    }

    // ----------------------------------------------------------------
    // Verify only (don't consume – used for intermediate checks)
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public void verifyOtp(User user, String code, OtpType type) {
        OtpToken otp = otpTokenRepository
            .findByTokenAndTypeAndUsedFalse(code, type)
            .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!otp.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Invalid OTP");
        }
        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }
    }

    // ----------------------------------------------------------------
    // Verify and consume (one-time use)
    // ----------------------------------------------------------------
    @Transactional
    public void verifyAndConsumeOtp(User user, String code, OtpType type) {
        OtpToken otp = otpTokenRepository
            .findByTokenAndTypeAndUsedFalse(code, type)
            .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!otp.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Invalid OTP");
        }
        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        otp.setUsed(true);
        otp.setUsedAt(LocalDateTime.now());
        otpTokenRepository.save(otp);
    }

    // ----------------------------------------------------------------
    // Cleanup expired tokens – runs every hour
    // ----------------------------------------------------------------
    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = otpTokenRepository.deleteExpiredTokens(LocalDateTime.now().minusHours(1));
        if (deleted > 0) log.info("Cleaned up {} expired OTP tokens", deleted);
    }
}
