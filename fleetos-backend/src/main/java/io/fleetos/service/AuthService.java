package io.fleetos.service;

import io.fleetos.dto.request.auth.*;
import io.fleetos.dto.response.auth.AuthResponse;
import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.entity.User;
import io.fleetos.enums.NotificationType;
import io.fleetos.enums.OtpType;
import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import io.fleetos.exception.*;
import io.fleetos.repository.UserRepository;
import io.fleetos.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtTokenProvider     jwtTokenProvider;
    private final AuthenticationManager authManager;
    private final UserDetailsService   userDetailsService;
    private final OtpService           otpService;
    private final NotificationService  notificationService;

    // ----------------------------------------------------------------
    // Login
    // ----------------------------------------------------------------
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException("Account is suspended. Contact support.");
        }

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtTokenProvider.generateToken(ud, Map.of(
            "role", user.getRole().name(),
            "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    // ----------------------------------------------------------------
    // Register
    // ----------------------------------------------------------------
    @Transactional
    public UserSummaryDto register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already in use: " + req.getEmail());
        }

        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail().toLowerCase().trim())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .role(UserRole.USER)
            .status(UserStatus.ACTIVE)
            .emailVerified(false)
            .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        // Send welcome notification asynchronously
        notificationService.createForUser(user, "Welcome to FleetOS!",
            "Your account has been created successfully.", NotificationType.USER_REGISTERED,
            "USER", user.getId());

        // Send email verification OTP
        otpService.sendOtp(user, OtpType.EMAIL_VERIFICATION);

        return mapToSummary(user);
    }

    // ----------------------------------------------------------------
    // OTP + Password reset
    // ----------------------------------------------------------------
    @Transactional
    public void sendPasswordResetOtp(SendOtpRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));
        otpService.sendOtp(user, OtpType.PASSWORD_RESET);
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.verifyOtp(user, req.getOtp(), OtpType.EMAIL_VERIFICATION);
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        otpService.verifyAndConsumeOtp(user, req.getOtp(), OtpType.PASSWORD_RESET);
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset for user: {}", user.getEmail());
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------
    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getExpirySeconds())
            .userId(user.getId())
            .uuid(user.getUuid())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole())
            .profileImageUrl(user.getProfileImageUrl())
            .build();
    }

    public UserSummaryDto mapToSummary(User user) {
        return UserSummaryDto.builder()
            .id(user.getId())
            .uuid(user.getUuid())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole())
            .status(user.getStatus())
            .emailVerified(user.getEmailVerified())
            .profileImageUrl(user.getProfileImageUrl())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
