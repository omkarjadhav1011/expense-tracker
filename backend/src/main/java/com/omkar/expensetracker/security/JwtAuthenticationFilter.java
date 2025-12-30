package com.omkar.expensetracker.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            UserDetailsServiceImpl userDetailsService
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 🔹 1. Get Authorization header
        String header = request.getHeader("Authorization");

        // 🔹 2. Check Bearer token
        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            // 🔹 3. Validate token
            if (jwtTokenProvider.validateToken(token)) {

                // 🔹 4. Extract user email
                String email = jwtTokenProvider.getEmailFromToken(token);

                // 🔹 5. Load user details
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                // 🔹 6. Create authentication
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 🔹 7. Set SecurityContext
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }
        }

        // 🔹 Continue filter chain
        filterChain.doFilter(request, response);
    }
}
