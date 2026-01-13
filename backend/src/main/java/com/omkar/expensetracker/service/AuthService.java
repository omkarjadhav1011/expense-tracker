package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.LoginRequest;
import com.omkar.expensetracker.dto.request.RegisterRequest;

public interface AuthService {

    void register(RegisterRequest request);

    String login(LoginRequest request);

    void registerUser(RegisterRequest request);
}
