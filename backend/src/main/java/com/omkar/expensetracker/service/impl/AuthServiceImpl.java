package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.LoginRequest;
import com.omkar.expensetracker.dto.request.RegisterRequest;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.repository.UserRepository;
import com.omkar.expensetracker.security.JwtTokenProvider;
import com.omkar.expensetracker.service.AuthService;
import com.omkar.expensetracker.service.CategoryService;
import jakarta.transaction.Transactional;
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
    private final JwtTokenProvider jwtTokenProvider;
    private final CategoryService categoryService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            CategoryService categoryService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.categoryService = categoryService;
    }

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

    @Override
    public String login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            return jwtTokenProvider.generateToken(request.getEmail());
        } catch (AuthenticationException ex) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    @Override
    @Transactional
    public void registerUser(RegisterRequest request) {

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency("INR")
                .build();

        User savedUser = userRepository.save(user);
        categoryService.createDefaultCategoriesForUser(savedUser);
    }
}
