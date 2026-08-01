package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.LoginRequest;
import com.omkar.expensetracker.dto.request.RegisterRequest;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.repository.UserRepository;
import com.omkar.expensetracker.security.JwtTokenProvider;
import com.omkar.expensetracker.service.AuthService;
import com.omkar.expensetracker.service.CategoryService;
import com.omkar.expensetracker.util.AuthUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CategoryService categoryService;
    private final AuthUtil authUtil;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            CategoryService categoryService,
            AuthUtil authUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.categoryService = categoryService;
        this.authUtil = authUtil;
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

        // Without this the users.email unique constraint fires instead, and
        // GlobalExceptionHandler renders the raw Hibernate/PostgreSQL message
        // straight into the signup form.
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency("INR")
                .build();

        User savedUser = userRepository.save(user);
        categoryService.createDefaultCategoriesForUser(savedUser);
    }

    /**
     * Delegates to AuthUtil rather than reading SecurityContextHolder again, so
     * there is exactly one implementation of "who is logged in". Two copies is how
     * the ownership checks drifted apart in the first place.
     */
    @Override
    public Long getCurrentUserId() {
        return authUtil.getLoggedInUser().getId();
    }
}
