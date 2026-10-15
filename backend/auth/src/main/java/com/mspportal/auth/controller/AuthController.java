package com.mspportal.auth.controller;

import com.mspportal.auth.dto.AuthRequest;
import com.mspportal.auth.dto.AuthResponse;
import com.mspportal.auth.entity.User;
import com.mspportal.auth.repository.UserRepository;
import com.mspportal.auth.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.mspportal.auth.repository.TenantRepository;
import com.mspportal.auth.entity.Tenant;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import com.mspportal.auth.dto.TenantResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, TenantRepository tenantRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                String jwt = tokenProvider.generateToken(user.getEmail(), user.getRole(), user.getTenantIdentifier());
                return ResponseEntity.ok(new AuthResponse(jwt, user.getEmail(), user.getRole(), user.getTenantIdentifier()));
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Tenant tenant = tenantRepository.findByTenantIdentifier(user.getTenantIdentifier())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        return ResponseEntity.ok(new com.mspportal.auth.dto.UserProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                tenant.getTenantIdentifier(),
                tenant.getName()
        ));
    }

    @GetMapping("/tenants")
    @PreAuthorize("hasAuthority('ROLE_PLATFORM_ADMIN')")
    public ResponseEntity<List<TenantResponse>> getAccessibleTenants() {
        List<TenantResponse> tenants = tenantRepository.findAll().stream()
                .map(t -> new TenantResponse(t.getTenantIdentifier(), t.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(tenants);
    }
}
