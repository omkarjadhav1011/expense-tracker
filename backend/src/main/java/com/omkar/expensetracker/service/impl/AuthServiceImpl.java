package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.LoginRequest;
import com.omkar.expensetracker.dto.request.RegisterRequest;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.repository.UserRepository;
import com.omkar.expensetracker.security.JwtTokenProvider;
import com.omkar.expensetracker.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider; // 🔥 FINAL FIELD

    // 🔥 CONSTRUCTOR INJECTION (MANDATORY)
    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider; // 🔥 INITIALIZED HERE
    }

    // ================= REGISTER =================
    @Override
    public void register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
    }

    // ================= LOGIN =================
    @Override
    public String login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // 🔥 JWT GENERATED HERE
            return jwtTokenProvider.generateToken(request.getEmail());

        } catch (AuthenticationException ex) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}
