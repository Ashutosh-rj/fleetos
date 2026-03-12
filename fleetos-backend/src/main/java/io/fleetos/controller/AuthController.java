package io.fleetos.controller;

import io.fleetos.dto.request.auth.*;
import io.fleetos.dto.response.ApiResponse;
import io.fleetos.dto.response.auth.AuthResponse;
import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", resp));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserSummaryDto>> register(
            @Valid @RequestBody RegisterRequest req) {
        UserSummaryDto dto = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Account created. Please verify your email.", dto));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody SendOtpRequest req) {
        authService.sendPasswordResetOtp(req);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + req.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest req) {
        authService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }
}
