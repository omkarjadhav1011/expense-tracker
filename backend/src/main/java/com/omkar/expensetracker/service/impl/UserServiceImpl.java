package com.omkar.expensetracker.service.impl;

import com.omkar.expensetracker.dto.request.UpdateUserRequest;
import com.omkar.expensetracker.dto.response.UserResponse;
import com.omkar.expensetracker.entity.User;
import com.omkar.expensetracker.service.UserService;
import com.omkar.expensetracker.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.Builder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final AuthUtil authUtil;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {

        User user = authUtil.getLoggedInUser();

        return mapToResponse(user);
    }

    @Override
    public UserResponse updateCurrentUser(UpdateUserRequest request) {

        User user = authUtil.getLoggedInUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            user.setCurrency(request.getCurrency());
        }

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency()
        );
    }

}
