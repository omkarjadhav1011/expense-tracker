package com.omkar.expensetracker.config;

public class JwtConfig {

    // 🔥 MUST be at least 256-bit (32 chars)
    public static final String SECRET_KEY =
            "expensetracker_super_secret_key_256_bits!";

    public static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour
}
