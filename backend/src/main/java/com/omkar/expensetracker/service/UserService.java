package com.omkar.expensetracker.service;

import com.omkar.expensetracker.dto.request.UpdateUserRequest;
import com.omkar.expensetracker.dto.response.UserResponse;

public interface UserService {

    UserResponse getCurrentUser();

    UserResponse updateCurrentUser(UpdateUserRequest request);
}
